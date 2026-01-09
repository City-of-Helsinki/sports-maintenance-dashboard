import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import _ from 'lodash';

import { ACTION_TYPE, canPropertyBeMaintained, HELP_TEXTS } from './UpdateConfirmation';
import { allowedValuesByQuality } from './UnitDetails';
import ObservationItem from './ObservationItem';
import { unitObservableProperties } from '../lib/municipalServicesClient';
import * as constants from '../constants/index';
import * as actions from '../actions/index';
import { RootState } from '../reducers/types';
import { Unit, ObservableProperty, AllowedValue, UnitObservation } from '../types';

import { QUALITIES } from './utils';

interface FormValues {
  units: string[];
  quality: string;
  observationType: string;
  notice: string;
}

// Extended AllowedValue type with property for internal use
type AllowedValueWithProperty = AllowedValue & {
  property: string;
};

const UnitMassEdit: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams<{ groupId: string; propertyId: string }>();
  
  const unit = useSelector((state: RootState) => state.data.unit);
  const service = useSelector((state: RootState) => state.data.service);
  const serviceGroup = useSelector((state: RootState) => state.serviceGroup);
  
  const [formValues, setFormValues] = useState<FormValues>({
    units: [],
    quality: '',
    observationType: '',
    notice: ''
  });

  if (!params.groupId || !params.propertyId) {
    return <div>Virheellinen parametrit</div>;
  }

  const { groupId, propertyId } = params;
  const onlyQualityProperties = serviceGroup !== constants.SERVICE_GROUPS.swimming.id;
  const units = unit ? _.filter(unit, (u: Unit) => u.extensions?.maintenance_group === groupId) : undefined;

  let allowedValues: Record<string, Record<string, AllowedValue[]>> = {};
  let unitsIncludingSelectedProperty: Unit[] = [];
  let observableProperty: ObservableProperty | undefined;

  if (units) {
    units.forEach((u: Unit) => {
      const allObservableProperties = unitObservableProperties(u, service, onlyQualityProperties);
      const selectedObservableProperty = _.find(allObservableProperties, (op: ObservableProperty) => op.id === propertyId);
      const selectedObservablePropertyId = selectedObservableProperty?.id;
      if (selectedObservablePropertyId === propertyId) {
        unitsIncludingSelectedProperty.push(u);
        if (selectedObservableProperty) {
          observableProperty = selectedObservableProperty;
        }
      }
    });
  }

  if (observableProperty) {
    allowedValues = { [observableProperty.id]: allowedValuesByQuality(observableProperty) };
  }

  const unitsHeader = 'Valitse päivitettävät paikat';
  const qualityHeader = observableProperty?.name ? observableProperty.name.fi : 'Kuntotilanne';
  const observationHeader = 'Vahvista valinta';
  const noticeHeader = 'Päivitä kuntokuvaus';
  const hasUnitsSelected = !!formValues.units.length;
  const hasQualitySelected = !!formValues.quality;
  const hasObservationTypeSelected = !!formValues.observationType;
  const submitEnabled = hasUnitsSelected && hasQualitySelected && hasObservationTypeSelected;

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = event.target as HTMLInputElement;
    const { value, name, checked, type } = target;

    if (type === 'checkbox') {
      let newChoices = [...formValues[name as keyof FormValues] as string[]];
      newChoices = newChoices.filter(e => e !== value);
      if (checked) {
        newChoices.push(value);
      }
      setFormValues({
        ...formValues,
        [name]: newChoices
      });
    } else if (name === 'quality') {
      // Reset observationType selection when changing quality
      setFormValues({
        ...formValues,
        [name]: value,
        observationType: ''
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  }

  function allowedValue(): AllowedValueWithProperty | undefined {
    if (!observableProperty || !formValues?.quality) return undefined;

    return _.find(observableProperty.allowed_values, (value: AllowedValue) => {
      const valueWithProperty = value as AllowedValueWithProperty;
      valueWithProperty.property = observableProperty.id;
      return value.identifier === formValues.quality;
    }) as AllowedValueWithProperty | undefined;
  }

  function onSubmit() {
    if (!observableProperty) return;
    
    const propertyId = observableProperty.id;
    const unitIds = formValues.units;
    const value = allowedValue();
    const isServiced = formValues.observationType === 'serviced';
    const notice = formValues.notice;

    unitIds.forEach((unitId: string) => {
      dispatch((actions.enqueueObservation as any)(propertyId, value?.identifier || '', Number.parseInt(unitId, 10), isServiced));
      if (notice) {
        dispatch((actions.enqueueObservation as any)('notice', notice, Number.parseInt(unitId, 10)));
      }
    });

    return navigate('/queue');
  }

  if (units === undefined) {
    return <div>Ladataan...</div>;
  }

  const renderUnitInputs = _.map(_.sortBy(unitsIncludingSelectedProperty, [(u: Unit) => u.name.fi]), (unit: Unit) => {
    const observations = _.map(
      unit.observations || [],
      (obs: UnitObservation) => { return <ObservationItem key={obs.id} observation={obs} />; }
    );
    return (
      <div key={unit.id} className="mass-edit-checkbox">
        <input
          type="checkbox"
          value={unit.id}
          name="units"
          id={`id-${unit.id}`}
          checked={_.includes(formValues.units, unit.id.toString())}
          onChange={handleChange}
        />
        <label htmlFor={`id-${unit.id}`}>
          {unit.name.fi}
        </label>
        <div className="observations">{observations}</div>
      </div>
    );
  });

  const renderQualityInputs = (): React.ReactElement[] => {
    if (!observableProperty) return [];
    
    let values: React.ReactElement[] = [];

    _.each(QUALITIES, (quality: string) => {
      const qualityValues = allowedValues[observableProperty.id]?.[quality] || [];
      values = values.concat(_.map(qualityValues, (v: AllowedValue) => {
        return (
          <div key={v.identifier} className="mass-edit-radio">
            <input
              type="radio"
              value={v.identifier}
              name="quality"
              id={`id-${observableProperty.id}-${v.identifier}`}
              checked={formValues.quality === v.identifier}
              onChange={handleChange}
              disabled={!hasUnitsSelected}
            />
            <label htmlFor={`id-${observableProperty.id}-${v.identifier}`}>{v.name.fi}</label>
          </div>
        );
      }));
    });

    return values;
  };

  const renderConfirmation = (): React.ReactElement | undefined => {
    const value = allowedValue();

    if (!value) return;

    const render = (): React.ReactElement => {
      const quality = value.quality;

      const observedOption = (showHelpText: boolean = true): React.ReactElement => (
        <div className="mass-edit-radio">
          <input
            type="radio"
            value="observed"
            name="observationType"
            id="id-observed"
            checked={formValues.observationType === 'observed'}
            onChange={handleChange}
            disabled={!hasUnitsSelected}
          />
          <label htmlFor="id-observed">{`${ACTION_TYPE.observed} - ${value.name.fi}`}</label>
          {showHelpText && <div className="small text-muted">{HELP_TEXTS.observed} "{value.name.fi}".</div>}
        </div>
      );

      const servicedOption = (
        <div className="mass-edit-radio">
          <input
            type="radio"
            value="serviced"
            name="observationType"
            id="id-serviced"
            checked={formValues.observationType === 'serviced'}
            onChange={handleChange}
            disabled={!hasUnitsSelected}
          />
          <label htmlFor="id-serviced">{`${ACTION_TYPE.serviced} - ${value.name.fi}`}</label>
          <div className="small text-muted">{HELP_TEXTS.serviced} "{value.name.fi}".</div>
        </div>
      );

      if (canPropertyBeMaintained(value.property) && (
        quality === 'good' || quality === 'satisfactory' || value.identifier === 'event')
      ) {
        return (
          <>
            {observedOption()}
            {servicedOption}
          </>
        );
      } else {
        return observedOption(false);
      }
    };

    return (
      <div className="panel panel-default">
        <div className="panel-heading">{observationHeader}</div>
        <div className="panel-body">
          {render()}
        </div>
      </div>
    );
  };

  const renderNoticeField = (): React.ReactElement => (
    <div className="panel panel-default">
      <div className="panel-heading">{noticeHeader}</div>
      <div className="panel-body">
        {!hasUnitsSelected && <p className="text-muted"><em>Valitse ensin päivitettävät paikat</em></p>}
        {hasUnitsSelected && <>
          <textarea
            id="notice"
            name="notice"
            className="form-control"
            rows={3}
            value={formValues.notice}
            onChange={handleChange}
            disabled={!hasUnitsSelected}
            placeholder="Kirjoita tähän suomen kielellä kuvaus valittujen paikkojen tilanteesta."
          />
          <p className="help-block small">Huom! Jätä kenttä tyhjäksi, jos haluat pitää edelliset tallennetut kuntokuvaukset.</p>
        </>}
      </div>
    </div>
  );

  return (
    <div className="mass-edit-wrapper">
      <div className="list-group facility-return clearfix">
        <Link to={`/group/${groupId}/mass-edit`} className="list-group-item">
          <span className="action-icon glyphicon glyphicon-chevron-left"></span>
          {' '}Takaisin
        </Link>
      </div>
      <h4>Massapäivitys ({qualityHeader})</h4>
      <div className="panel panel-default">
        <div className="panel-heading">{unitsHeader}</div>
        <div className="panel-body">
          {renderUnitInputs}
        </div>
      </div>
      {!!observableProperty && (
        <>
          <div className="panel panel-default">
            <div className="panel-heading">{qualityHeader}</div>
            <div className="panel-body">
              {renderQualityInputs()}
            </div>
          </div>
          {(hasUnitsSelected && hasQualitySelected) && renderConfirmation()}
        </>
      )}
      {renderNoticeField()}
      <div className="row">
        <div className="col-xs-6">
          <Link to={`/group/${groupId}/mass-edit`} className="btn btn-default">
            Peruuta
          </Link>
        </div>
        <div className="col-xs-6 text-right">
          <button type="button" className="btn btn-primary" disabled={!submitEnabled} onClick={onSubmit}>
            Tee päivitys
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitMassEdit;
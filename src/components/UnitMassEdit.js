import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { ACTION_TYPE, canPropertyBeMaintained, HELP_TEXTS } from './UpdateConfirmation';
import { allowedValuesByQuality } from './UnitDetails';
import { Observation } from './UnitStatusSummary';
import { unitObservableProperties } from '../lib/municipal-services-client';
import { withRouter } from '../hooks';
import * as constants from '../constants/index';
import * as actions from '../actions/index';

import { QUALITIES } from './utils';

const UnitMassEdit = (props) => {
  const { units, groupId, observableProperty, allowedValues, enqueueObservation, navigate } = props;
  const [formValues, setFormValues] = useState({
    units: [],
    quality: '',
    observationType: '',
    notice: ''
  });
  const unitsHeader = 'Valitse päivitettävät paikat';
  const qualityHeader = observableProperty.name ? observableProperty.name.fi : 'Kuntotilanne';
  const observationHeader = 'Vahvista valinta';
  const noticeHeader = 'Päivitä kuntokuvaus';
  const hasUnitsSelected = !!formValues.units.length;
  const hasQualitySelected = !!formValues.quality;
  const hasObservationTypeSelected = !!formValues.observationType;
  const submitEnabled = hasUnitsSelected && hasQualitySelected && hasObservationTypeSelected;

  function handleChange(event) {
    const { value, name, checked, type } = event.target;

    if (type === 'checkbox') {
      let newChoices = [...formValues[name]];
      newChoices = newChoices.filter(e => e !== value);
      if (checked) {
        newChoices.push(value);
      }
      setFormValues({
        ...formValues,
        [name]: newChoices
      });
    } else {
      if (name === 'quality') {
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
  }

  function allowedValue() {
    if (!observableProperty || !formValues?.quality) return undefined;

    return _.find(observableProperty.allowed_values, (value) => {
      value.property = observableProperty.id;
      return (value.identifier == formValues.quality);
    });
  }

  function onSubmit() {
    const propertyId = observableProperty?.id;
    const unitIds = formValues.units;
    const value = allowedValue();
    const isServiced = formValues.observationType === 'serviced';
    const notice = formValues.notice;

    unitIds.map((unitId) => {
      enqueueObservation(propertyId, value, parseInt(unitId), isServiced);
      if (notice) {
        enqueueObservation('notice', notice, parseInt(unitId));
      }
    });

    return navigate('/queue');
  }

  if (units === undefined) {
    return <div>Ladataan...</div>;
  }

  const renderUnitInputs = _.map(_.sortBy(units, [(u) => u.name.fi]), (unit) => {
    const observations = _.map(
      unit.observations,
      (obs) => { return <Observation key={obs.id} {...obs} />; }
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

  const renderQualityInputs = () => {
    let values = [];

    _.each(QUALITIES, (quality) => {
      values = values.concat(_.map(allowedValues[observableProperty.id][quality], (v) => {
        return (
          <div key={v.identifier} className="mass-edit-radio">
            <input
              type="radio"
              value={v.identifier}
              name="quality"
              id={`id-${v.property}-${v.identifier}`}
              checked={formValues.quality === v.identifier}
              onChange={handleChange}
              disabled={!hasUnitsSelected}
            />
            <label htmlFor={`id-${v.property}-${v.identifier}`}>{v.name.fi}</label>
          </div>
        )
      }));
    });

    return values;
  }

  const renderConfirmation = () => {
    const value = allowedValue();

    if (!value) return;

    const render = () => {
      const quality = value.quality;

      const observedOption = (showHelpText=true) => (
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
        quality === 'good' || quality == 'satisfactory' || value.identifier == 'event')
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

  const renderNoticeField = () => (
    <div className="panel panel-default">
      <div className="panel-heading">{noticeHeader}</div>
      <div className="panel-body">
        {!hasUnitsSelected && <p className="text-muted"><em>Valitse ensin päivitettävät paikat</em></p>}
        {hasUnitsSelected && <>
          <textarea
            id="notice"
            name="notice"
            className="form-control"
            rows="3"
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
          Takaisin
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
              {!hasUnitsSelected && <p className="text-muted"><em>Valitse ensin päivitettävät paikat</em></p>}
              {hasUnitsSelected && renderQualityInputs()}
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
}

function mapStateToProps(state, ownProps) {
  const { groupId, propertyId } = ownProps.params;
  const { unit, service } = state.data;
  const onlyQualityProperties = state.serviceGroup !== constants.SERVICE_GROUPS.swimming.id;
  const units = _.filter(unit, (u) => u.extensions.maintenance_group);

  let allowedValues;
  let unitsIncludingSelectedProperty = [];
  let observableProperty;

  units.map((u) => {
    const allObservableProperties = unitObservableProperties(u, service, onlyQualityProperties);
    const selectedObservableProperty = _.filter(allObservableProperties, (op) => op.id === propertyId);
    const selectedObservablePropertyId = selectedObservableProperty[0]?.id;
    if (selectedObservablePropertyId === propertyId) {
      unitsIncludingSelectedProperty.push(u);
      observableProperty = selectedObservableProperty;
    }
  });

  if (observableProperty) {
    allowedValues = _.fromPairs(_.map(observableProperty, (p) => [p.id, allowedValuesByQuality(p)]))
  }

  return {
    allowedValues,
    groupId,
    observableProperty: Object.assign({}, ...observableProperty),
    units: unitsIncludingSelectedProperty
  };
}

function mapDispatchToProps(dispatch) {
  return {
    enqueueObservation: (property, allowedValue, unitId, addServicedObservation) => {
      dispatch(actions.enqueueObservation(property, allowedValue, unitId, addServicedObservation));
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UnitMassEdit));

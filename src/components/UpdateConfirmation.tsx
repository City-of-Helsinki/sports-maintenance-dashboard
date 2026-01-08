import _ from 'lodash';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import { COLORS, ICONS } from './utils';
import { unitObservableProperties } from '../lib/municipalServicesClient';
import { AllowedValue, ObservableProperty } from '../types';
import { RootState } from '../reducers/types';

import * as actions from '../actions/index';

export const ACTION_TYPE = {
  observed: 'Todettu',
  serviced: 'Kunnostettu'
} as const;

export const HELP_TEXTS = {
  observed: `Valitse "${ACTION_TYPE.observed}" jos liikuntapaikkaa ei ole juuri nyt kunnostettu, mutta haluat merkitä sen tilaksi`,
  serviced: `Valitse "${ACTION_TYPE.serviced}" jos liikuntapaikka on juuri kunnostettu, ja haluat samalla merkitä sen tilaksi`
} as const;

type ActionType = keyof typeof ACTION_TYPE;

interface ConfirmButtonProps {
  unitId: number;
  allowedValue: AllowedValue;
  type: ActionType;
  enqueueObservation: (property: string, allowedValue: AllowedValue, unitId: number, addServicedObservation?: boolean) => void;
}

function ConfirmButton({ unitId, allowedValue, type, enqueueObservation }: Readonly<ConfirmButtonProps>) {
  const iconClassName = `icon ${ICONS[allowedValue.identifier]}`;
  const buttonClassName = `btn btn-${COLORS[allowedValue.quality] || 'primary'} btn-block btn__confirmation`;
  return (
    <Link to={`/unit/${unitId}`} className={buttonClassName} onClick={() => { enqueueObservation(allowedValue.property, allowedValue, unitId, (type === 'serviced')); }}>
      <h6>{ ACTION_TYPE[type] }</h6>
      <span className={iconClassName}></span><br/>
      { allowedValue.name.fi }
    </Link>
  );
}

export function canPropertyBeMaintained(property: string): boolean {
  return property !== 'swimming_water_cyanobacteria';
}

interface AllowedValueParams {
  propertyId: string;
  valueId: string;
}

function allowedValueSelector(properties: ObservableProperty[], { propertyId, valueId }: AllowedValueParams): AllowedValue | null {
  if (properties.length === 0) {
    return null;
  }
  const property = _.find(properties, (p) => { return p.id == propertyId; });
  if (!property) {
    return null;
  }
  const foundValue = _.find(property.allowed_values, (value) => {
    return (value.identifier == valueId);
  });
  if (!foundValue) {
    return null;
  }
  return {
    ...foundValue,
    property: property.id
  };
}

interface Params extends Record<string, string> {
  unitId: string;
  propertyId: string;
  valueId: string;
}

const UpdateConfirmation: React.FC = () => {
  const params = useParams<Params>();
  const dispatch = useDispatch();
  
  const unit = useSelector((state: RootState) =>
    params.unitId ? state.data.unit[Number(params.unitId)] : undefined
  );
  
  const services = useSelector((state: RootState) => state.data.service);
  
  const observableProperties = useMemo(() => {
    if (!unit) return [];
    return unitObservableProperties(unit, services);
  }, [unit, services]);
  
  const allowedValue = useMemo(() => {
    if (!params.unitId || !params.propertyId || !params.valueId) return null;
    return allowedValueSelector(
      observableProperties,
      { propertyId: params.propertyId, valueId: params.valueId }
    );
  }, [observableProperties, params.propertyId, params.valueId]);

  const enqueueObservation = (property: string, allowedValue: AllowedValue, unitId: number, addServicedObservation?: boolean) => {
    dispatch((actions.enqueueObservation as any)(property, allowedValue, unitId, addServicedObservation));
  };

  if (unit === undefined || allowedValue === null) {
    return <div>Ladataan...</div>;
  }
  
  const quality = allowedValue.quality;
  let buttonRow: React.ReactNode;
  let helpRow: React.ReactNode;
  
  if (canPropertyBeMaintained(allowedValue.property) &&
      (quality === 'good' ||
       quality === 'satisfactory' ||
       allowedValue.identifier === 'event')) {
    buttonRow = (
      <div className="row">
        <div className="col-xs-6">
          <ConfirmButton type='observed' unitId={unit.id} allowedValue={allowedValue} enqueueObservation={enqueueObservation} />
        </div>
        <div className="col-xs-6">
          <ConfirmButton type='serviced' unitId={unit.id} allowedValue={allowedValue} enqueueObservation={enqueueObservation} />
        </div>
      </div>
    );
    helpRow = (
      <div className="row">
        <div className="col-xs-6">
          <p className="help-block"><small>{ HELP_TEXTS.observed } "{allowedValue.name.fi}".</small></p>
        </div>
        <div className="col-xs-6">
          <p className="help-block"><small>{ HELP_TEXTS.serviced } "{allowedValue.name.fi}".</small></p>
        </div>
      </div>
    );
  } else {
    buttonRow = (
      <div className="row">
        <div className="col-xs-12">
          <ConfirmButton type='observed' unitId={unit.id} allowedValue={allowedValue} enqueueObservation={enqueueObservation} />
        </div>
      </div>);
    helpRow = null;
  }
  const unitUrl = `/unit/${unit.id}`;
  return (
    <div className="facility-status">
      <UnitStatusSummary unit={unit} />
      <div className="panel panel-warning">
        <div className="panel-heading">
          <h6>Oletko varma että haluat päivittää paikan kuntotiedon?</h6>
        </div>
        <div className="panel-body">
          { buttonRow }
          <div className="row">
            <div className="col-xs-12">
              <br/>
              <Link to={unitUrl} className="btn btn-primary btn-block"><h5>Peruuta</h5></Link>
            </div>
          </div>
          { helpRow }
        </div>
      </div>
    </div>
  );
};

export default UpdateConfirmation;
import _ from 'lodash';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import UnitDescriptiveStatusForm from './UnitDescriptiveStatusForm';
import { unitObservableProperties } from '../lib/municipalServicesClient';
import * as constants from '../constants/index';
import {
  ObservableProperty as ObservablePropertyType,
  AllowedValue,
  LocalizedText
} from '../types';

import { COLORS, ICONS, QUALITIES } from './utils';
import { RootState } from 'reducers/types';

// Component-specific interfaces
interface ObservablePropertyProps {
  quality: string;
  property: string;
  identifier: string;
  name: LocalizedText;
  unitId: number;
}

interface ObservablePropertyPanelProps {
  allowedValues: React.ReactElement[];
  header: string;
}

export function ObservableProperty({ quality, property, identifier, name, unitId }: ObservablePropertyProps): React.ReactElement {
  const url = `/unit/${unitId}/update/${property}/${identifier}`;
  const color = COLORS[quality] || 'primary';
  const icon = ICONS[identifier];
  const buttonClassName = `btn btn-${color} btn-block btn__newstatus`;
  const iconClassName = `icon ${icon}`;
  
  return <Link to={url} className={buttonClassName}><span className={iconClassName}></span><br />{name.fi}</Link>;
}

export function ObservablePropertyPanel({ allowedValues, header }: ObservablePropertyPanelProps): React.ReactElement {
  const amountOfValues = allowedValues.length;
  const cutPoint = (amountOfValues / 2) + (amountOfValues % 2);
  const left = allowedValues.slice(0, cutPoint);
  const right = allowedValues.slice(cutPoint, amountOfValues);

  return (
    <div className="panel panel-default">
      <div className="panel-heading">{ header }</div>
      <div className="panel-body">
        <div className="row">
          <div className="col-xs-6">
            { left }
          </div>
          <div className="col-xs-6">
            { right }
          </div>
        </div>
      </div>
    </div>
  );
}

const UnitDetails: React.FC = () => {
  const params = useParams<{ unitId: string }>();
  const unitId = params.unitId!;
  
  const unit = useSelector((state: RootState) => state.data.unit[unitId]);
  const isLoading = useSelector((state: RootState) => state.data.loading.unit === true);
  const serviceGroup = useSelector((state: RootState) => state.serviceGroup);
  const services = useSelector((state: RootState) => state.data.service);

  const observableProperties = useMemo(() => {
    if (!unit) return [];
    const onlyQualityProperties = serviceGroup !== constants.SERVICE_GROUPS.swimming.id;
    return unitObservableProperties(unit, services, onlyQualityProperties);
  }, [unit, services, serviceGroup]);

  const allowedValues = useMemo(() => {
    return _.fromPairs(_.map(observableProperties, (p) => [p.id, allowedValuesByQuality(p)]));
  }, [observableProperties]);

  if (isLoading) {
    return <div>Ladataan...</div>;
  }

  if (unit === undefined) {
    return <div>Toimipistettä ei löydy</div>;
  }



  const panels = _.map(observableProperties, (property) => {
    let values: React.ReactElement[] = [];

    _.each(QUALITIES, (quality) => {
      values = values.concat(_.map(allowedValues[property.id][quality], (v) => {
        return <ObservableProperty key={v.identifier} {...v} unitId={unit.id} />;
      }));
    });

    const header = property.name ? property.name.fi : 'Kuntotilanne';

    return <ObservablePropertyPanel key={property.id} allowedValues={values} header={header}/>;
  });

  return (
    <div className="facility-status">
      <UnitStatusSummary unit={unit} />
      {observableProperties.length > 0 && panels}
      <UnitDescriptiveStatusForm unit={unit} />
    </div>
  );
};

export function allowedValuesByQuality(property: ObservablePropertyType): Record<string, AllowedValue[]> {
  let result: Record<string, AllowedValue[]> = {};

  _.each(property.allowed_values, (value) => {
    const modifiedValue = { ...value, property: property.id };
    result[value.quality] = result[value.quality] || [];
    result[value.quality].push(modifiedValue);
  });
  
  return result;
}

export default UnitDetails;
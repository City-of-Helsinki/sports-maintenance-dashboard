import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import _ from 'lodash';

import { unitObservableProperties } from '../lib/municipalServicesClient';
import * as constants from '../constants/index';
import { RootState } from '../reducers/types';
import { Unit, ObservableProperty } from '../types';

interface UnitMassEditPropertySelectProps {}

const UnitMassEditPropertySelect: React.FC<UnitMassEditPropertySelectProps> = () => {
  const { groupId } = useParams<{ groupId: string }>();
  
  const unit = useSelector((state: RootState) => state.data.unit);
  const service = useSelector((state: RootState) => state.data.service);
  const serviceGroup = useSelector((state: RootState) => state.serviceGroup);
  const loading = useSelector((state: RootState) => state.data.loading);

  if (!groupId) {
    return <div>Virheellinen ryhmätunnus</div>;
  }

  // Show loading if unit or service data is still being loaded
  if (loading.unit || loading.service) {
    return <div>Ladataan...</div>;
  }

  // Filter units by group
  const units = _.filter(unit, (u: Unit) => u.extensions?.maintenance_group === groupId);
  const onlyQualityProperties = serviceGroup !== constants.SERVICE_GROUPS.swimming.id;

  // Get all available properties
  const properties: ObservableProperty[] = units.reduce((result: ObservableProperty[], currentUnit: Unit) => {
    const observableProperties = unitObservableProperties(currentUnit, service, onlyQualityProperties);
    if (observableProperties && Array.isArray(observableProperties)) {
      observableProperties.forEach((op: ObservableProperty) => {
        // Remove duplicate observable properties
        if (!result.some(res => res.id === op.id)) {
          result.push(op);
        }
      });
    }
    return result;
  }, []);

  if (!properties || properties.length === 0) {
    return <div>Ei muokattavia paikkoja</div>;
  }

  return (
    <div className="facility-status">
      <div className="list-group facility-return clearfix">
        <Link to={`/group/${groupId}`} className="list-group-item">
          <span className="action-icon glyphicon glyphicon-chevron-left"></span>
          {' '}Takaisin
        </Link>
      </div>
      <div className="well">
        <h4>Massapäivitys</h4>
        <p>Valitse päivitettävä tieto</p>
        <div className="list-group clearfix">
          {properties.map((p, index) => (
            <Link to={`/group/${groupId}/mass-edit/${p.id}`} className="list-group-item" key={index}>
              {p.name.fi}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitMassEditPropertySelect;
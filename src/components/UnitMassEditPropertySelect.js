import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { withRouter } from '../hooks';
import { unitObservableProperties } from '../lib/municipalServicesClient';
import * as constants from '../constants/index';

class UnitMassEditPropertySelect extends React.Component {
  render() {
    const { properties, groupId } = this.props;

    if (properties === undefined) {
      return <div>Ladataan...</div>;
    }

    if (!properties || Object.keys(properties).length === 0) {
      return <div>Ei muokattavia paikkoja</div>
    }

    return (
      <div className="facility-status">
        <div className="list-group facility-return clearfix">
          <Link to={`/group/${groupId}`} className="list-group-item">
            <span className="action-icon glyphicon glyphicon-chevron-left"></span>
            Takaisin
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
  }
}

function mapStateToProps(state, ownProps) {
  const { groupId } = ownProps.params;
  const { unit, service } = state.data;
  const units = _.filter(unit, (u) => u.extensions.maintenance_group === groupId);
  const onlyQualityProperties = state.serviceGroup !== constants.SERVICE_GROUPS.swimming.id;

  // Get all available properties
  const properties = units.reduce((result, currentUnit) => {
    const observableProperties = unitObservableProperties(currentUnit, service, onlyQualityProperties);
    observableProperties.map((op) => {
      // Remove duplicate observable properties
      if (result.findIndex(res => res.id === op.id) === -1) {
        result.push(op);
      }
    })
    return result;
  }, []);

  return {
    groupId,
    properties
  };
}

export default withRouter(connect(mapStateToProps, null)(UnitMassEditPropertySelect));

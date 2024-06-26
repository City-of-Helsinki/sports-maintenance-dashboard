require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import { connect } from 'react-redux';
import { Link, Outlet } from 'react-router-dom';
import _ from 'lodash';

import { fetchUnitsWithServices, fetchResource, setUserLocation, getNearestUnits } from '../actions/index';
import { getCurrentSeason } from './utils';
import { getInitialLocation } from '../lib/geolocation';
import { withRouter } from '../hooks/index';
import * as constants from '../constants/index';


function hasAuth(auth) {
  const { token } = auth;
  return !(token === null || token === undefined);
}

function requireAuth(navigate, auth) {
  if (!hasAuth(auth)) {
    return setTimeout(() => navigate('/login'), 1);
  }
  return true;
}

class AppComponent extends React.Component {
  componentDidMount() {
    let { navigate, auth } = this.props;
    requireAuth(navigate, auth);
    const services = constants.SERVICE_GROUPS[this.props.serviceGroup].services;
    this.props.fetchResource(
      'service', { id: services.join(',') },
      ['id', 'name'], ['observable_properties']
    );
    this.props.fetchUnitsWithServices(
      services, this.props.maintenanceOrganization, {
        selected: ['id', 'name', 'services', 'location', 'extensions'],
        embedded: ['observations']});
    getInitialLocation((position) => {
      this.props.setUserLocation(position);
      if (services) {
        this.props.getNearestUnits(position, services, this.props.maintenanceOrganization);
      }
    });
  }

  render() {
    let queueClassName = 'glyphicon glyphicon-transfer';
    let notificationCount;
    if (this.props.unsentUpdateCount > 0) {
      notificationCount = <span className="notification-count">{this.props.unsentUpdateCount}</span>;
    }
    else {
      notificationCount = null;
    }
    const serviceGroupTitle = constants.SERVICE_GROUPS[this.props.serviceGroup].title || '';
    const appTitle = `Pulkka ${getCurrentSeason()}`;

    return (
      <div className="index">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li><Link to="/"><div className="btn-lg"><span className="icon icon-home"></span></div></Link></li>
              <li><Link to="/group"><div className="btn-lg"><span className="icon icon-list"></span></div></Link></li>
              <li>
                <Link to="/queue">
                  <div className="btn-lg">
                    <span className={queueClassName}>
                      {notificationCount}
                    </span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="view-content container-fluid">
          <div className="secondary-nav">
            <div className="row">
              <div className="col-xs-6"><p className="pulkka-title">{serviceGroupTitle}</p></div>
              <div className="col-xs-6"><p className="pulkka-title text-right">{appTitle}</p></div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    unsentUpdateCount: _.size(state.updateQueue),
    maintenanceOrganization: state.auth.maintenance_organization,
    serviceGroup: state.serviceGroup
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUnitsWithServices: (services, maintenanceOrganization, fieldSpecs) => {
      dispatch(fetchUnitsWithServices(services, maintenanceOrganization, fieldSpecs));
    },
    fetchResource: (resourceType, filters, selected, embedded) => {
      dispatch(fetchResource(resourceType, filters, selected, embedded));
    },
    setUserLocation: (position) => {
      dispatch(setUserLocation(position));
    },
    getNearestUnits: (...args) => {
      dispatch(getNearestUnits(...args));
    }
  };
};

AppComponent.defaultProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AppComponent));

require('normalize.css/normalize.css');
require('styles/App.scss');

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import _ from 'lodash';

import { fetchUnitsWithServices, fetchResource, setUserLocation, getNearestUnits, setResourceFetchStart } from '../actions/index';
import { getCurrentSeason } from './utils';
import { getInitialLocation } from '../lib/geolocation';
import * as constants from '../constants/index';
import { RootState, AuthState } from '../reducers/types';

function hasAuth(auth: AuthState): boolean {
  const { token } = auth;
  return !(token === null || token === undefined);
}

function requireAuth(navigate: (path: string) => void, auth: AuthState): boolean {
  if (!hasAuth(auth)) {
    setTimeout(() => navigate('/login'), 1);
    return false;
  }
  return true;
}

const AppComponent: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  const auth = useSelector((state: RootState) => state.auth);
  const unsentUpdateCount = useSelector((state: RootState) => _.size(state.updateQueue));
  const maintenanceOrganization = useSelector((state: RootState) => state.auth.maintenance_organization);
  const serviceGroup = useSelector((state: RootState) => state.serviceGroup);

  useEffect(() => {
    // Check authentication and only proceed if user is authenticated
    if (!requireAuth(navigate, auth)) {
      return;
    }
    
    const services = constants.SERVICE_GROUPS[serviceGroup].services;
    dispatch(setResourceFetchStart('service'));
    dispatch(fetchResource(
      'service',
      { id: services.join(',') },
      ['id', 'name'],
      ['observable_properties']
    ));
    dispatch(setResourceFetchStart('unit'));
    dispatch(fetchUnitsWithServices(
      services,
      maintenanceOrganization,
      {
        selected: ['id', 'name', 'services', 'location', 'extensions'],
        embedded: ['observations']
      }
    ));
    getInitialLocation((position) => {
      dispatch(setUserLocation(position));
      if (services) {
        dispatch(getNearestUnits(position, services, maintenanceOrganization));
      }
    }, true);
  }, []); // Empty dependency array - runs only once on mount

  const queueClassName = 'glyphicon glyphicon-transfer';
  let notificationCount: React.ReactElement | null = null;
  
  if (unsentUpdateCount > 0) {
    notificationCount = <span className="notification-count">{unsentUpdateCount}</span>;
  }
  
  const serviceGroupTitle = constants.SERVICE_GROUPS[serviceGroup].title || '';
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
};

export default AppComponent;
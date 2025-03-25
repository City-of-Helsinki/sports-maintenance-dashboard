import _ from 'lodash';
import { createAction } from 'redux-actions';
import * as ApiClient from '../lib/municipal-services-client.js';

export const fetchUnitsWithServices = createAction(
  'GET_RESOURCE',
  ApiClient.fetchUnitsWithServices,
  () => {return { resourceType: 'unit', replaceAll: true };});

export const fetchResource = createAction(
  'GET_RESOURCE',
  ApiClient.fetchResource,
  (resourceType, filters, include, embed, meta) => {
    return Object.assign({}, meta, { resourceType });
  }
);

export const fetchUnitObservations = createAction(
  'GET_RESOURCE',
  ApiClient.fetchUnitObservations,
  (unitId) => {
    return { resourceType: 'observation', filters: { unit: unitId } };
  }
);

export const getNearestUnits = createAction(
  'GET_NEAREST_UNITS',
  ApiClient.getNearestUnits
);

export const login = createAction(
  'LOGIN',
  ApiClient.login
);

export const enqueueObservation = createAction(
  'ENQUEUE_OBSERVATION',
  (property, value, unitId, addServicedObservation=false) => {
    if (value && value.identifier !== undefined) {
      value = value.identifier;
    }
    return {
      addServicedObservation,
      unitId,
      value,
      property
    };
  }
);

export const markObservationSent = createAction('MARK_OBSERVATION_SENT');
export const markObservationResent = createAction('MARK_OBSERVATION_RESENT');
export const retryImmediately = createAction('FLUSH_UPDATE_QUEUE');
export const finishRetryImmediately = createAction('FLUSH_UPDATE_QUEUE_DISABLED');
export const selectServiceGroup = createAction('SELECT_SERVICE_GROUP');

export const setUserLocation = createAction('SET_USER_LOCATION');

export const sendObservation = createAction(
  'POST_OBSERVATION',
  ApiClient.postObservation,
  _.identity
);


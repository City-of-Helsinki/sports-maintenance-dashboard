import _ from 'lodash';
import { createAction, createActions } from 'redux-actions';
import * as ApiClient from '../lib/municipal-services-client.js';

export const fetchUnitsWithServices = createAction(
  'GET_RESOURCE',
  ApiClient.fetchUnitsWithServices,
  () => {return { resourceType: 'unit' };});

export const fetchResource = createAction(
  'GET_RESOURCE',
  ApiClient.fetchResource,
  (resourceType, filters, include, embed, meta) => {
    return Object.assign({}, meta, { resourceType });
  }
);

export const enqueueObservation = createAction(
  'ENQUEUE_OBSERVATION',
  (property, value, unitId, addServicedObservation=false) => {
    return {
      addServicedObservation,
      unitId,
      value: value.identifier,
      property
    };
  }
);

export const markObservationSent = createAction('MARK_OBSERVATION_SENT');
export const markObservationResent = createAction('MARK_OBSERVATION_RESENT');
export const retryImmediately = createAction('FLUSH_UPDATE_QUEUE');
export const finishRetryImmediately = createAction('FLUSH_UPDATE_QUEUE_DISABLED');
export const selectServiceGroup = createAction('SELECT_SERVICE_GROUP');
export const login = createAction('LOGIN_SUCCESS', (userName, password) => {
  return {userName, apiToken: 'fooBar'};
});

export const sendObservation = createAction(
  'POST_OBSERVATION',
  ApiClient.postObservation,
  _.identity
);


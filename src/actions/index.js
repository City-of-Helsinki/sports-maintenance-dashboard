import _ from 'lodash';
import { createAction } from 'redux-actions';
import * as ApiClient from '../lib/municipal-services-client.js';

export const fetchUnitsWithServices = createAction(
  'GET_RESOURCE',
  ApiClient.fetchUnitsWithServices,
  () => {return { resourceType: 'unit' };});

export const fetchResource = createAction(
  'GET_RESOURCE',
  ApiClient.fetchResource,
  (resourceType) => {return { resourceType };}
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

export const sendObservation = createAction(
  'POST_OBSERVATION',
  ApiClient.postObservation,
  _.identity
);

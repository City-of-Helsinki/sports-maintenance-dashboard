import _ from 'lodash';
import { createAction } from 'redux-actions';
import * as ApiClient from '../lib/municipalServicesClient';
import { ActionTypes } from '../constants';
import { AllowedValue } from 'types';

// Action creators with proper TypeScript types
export const setResourceFetchStart = createAction(
  ActionTypes.GET_RESOURCE_START,
  (resourceType: string) => resourceType,
  (resourceType: string) => ({ resourceType })
);

export const fetchUnitsWithServices = createAction(
  ActionTypes.GET_RESOURCE,
  ApiClient.fetchUnitsWithServices,
  () => ({ resourceType: 'unit', replaceAll: true })
);

export const fetchResource = createAction(
  ActionTypes.GET_RESOURCE,
  ApiClient.fetchResource,
  (resourceType: string, filters?: any, include?: string[], embed?: string[], meta?: any) => {
    return { ...meta, resourceType };
  }
);

export const fetchUnitObservations = createAction(
  ActionTypes.GET_RESOURCE,
  ApiClient.fetchUnitObservations,
  (unitId: string) => {
    return { resourceType: 'observation', filters: { unit: unitId } };
  }
);

export const getNearestUnits = createAction(
  ActionTypes.GET_NEAREST_UNITS,
  ApiClient.getNearestUnits
);

export const login = createAction(
  ActionTypes.LOGIN,
  ApiClient.login
);

export const enqueueObservation = createAction(
  ActionTypes.ENQUEUE_OBSERVATION,
  (property: string, value: AllowedValue | string, unitId: number, addServicedObservation: boolean = false) => {
    let processedValue = value;
    if (typeof value === 'object' && value && 'identifier' in value && value.identifier !== undefined) {
      processedValue = value.identifier;
    }
    return {
      addServicedObservation,
      unitId,
      value: processedValue,
      property
    };
  }
);

export const markObservationSent = createAction(ActionTypes.MARK_OBSERVATION_SENT);
export const markObservationResent = createAction(ActionTypes.MARK_OBSERVATION_RESENT);
export const retryImmediately = createAction(ActionTypes.FLUSH_UPDATE_QUEUE);
export const finishRetryImmediately = createAction(ActionTypes.FLUSH_UPDATE_QUEUE_DISABLED);
export const selectServiceGroup = createAction(ActionTypes.SELECT_SERVICE_GROUP);

export const setUserLocation = createAction(ActionTypes.SET_USER_LOCATION);

export const sendObservation = createAction(
  ActionTypes.POST_OBSERVATION,
  ApiClient.postObservation,
  _.identity
);


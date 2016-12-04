import { combineReducers } from 'redux';
import _ from 'lodash';

import MOCK_GROUPS from './mock_groups.js';

const initialDataState = {
  unit: {},
  unitsByDistance: [],
  group: MOCK_GROUPS,
  observable_property: {},
  observation: {},
  service: {}
};

const initialAuthState = {
  maintenance_organization: null,
  token: null,
  error: null
};

const initialPendingObservationsState = {};

const manuallyFlushUpdateQueue = false;

const serviceGroup = 'skiing';

function dataReducer(state = initialDataState, action) {
  switch (action.type) {
    case 'GET_RESOURCE':
      const resourceType = action.meta.resourceType;
      return Object.assign(
        {}, state,
        {[resourceType]: Object.assign(
          state[resourceType],
          action.payload[resourceType])});
    case 'GET_NEAREST_UNITS':
      return Object.assign(
        {}, state,
        {unitsByDistance: action.payload});
  }
  return state;
}

function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case 'LOGIN':
      if (action.error) {
        return {
          error: action.payload,
          token: null,
          maintenance_organization: null
        };
      }
    const {maintenance_organization, token} = action.payload;
    if (!maintenance_organization || !token) {
      return {
        error: action.payload,
        maintenance_organization,
        token
      };
    }
    return {
      error: null,
      maintenance_organization,
      token
    };
  }
  return state;
}

function observationPath({unitId, property}) {
  return `${unitId}.${property}`;
}

function createObservationData(payload, status) {
  const { unitId, value, property, addServicedObservation, serviced } = payload;
  return {
    unitId,
    status,
    serviced: addServicedObservation || serviced,
    property,
    value: value
  };
}

function pendingObservationsReducer(state = initialPendingObservationsState, action) {
  let path = null;
  switch (action.type) {
    case 'ENQUEUE_OBSERVATION':
      path = observationPath(action.payload);
      return Object.assign({}, state, {[path]: createObservationData(action.payload, 'enqueued')});
    case 'MARK_OBSERVATION_SENT':
      path = observationPath(action.payload);
      return Object.assign({}, state, {[path]: createObservationData(action.payload, 'pending')});
    case 'MARK_OBSERVATION_RESENT':
      path = observationPath(action.payload);
      return Object.assign({}, state, {[path]: createObservationData(action.payload, 'retrying')});
    case 'POST_OBSERVATION':
      if (action.error) {
        console.log(action);
        path = observationPath(action.meta);
        return Object.assign({}, state, {[path]: createObservationData(action.meta, 'failed')});
      }
      console.log(action);
      path = observationPath({unitId: action.payload.unit, property: action.payload.property});
      return Object.assign({}, state, {[path]: createObservationData({unitId: action.payload.unit, property: action.payload.property}, 'success')});
    case 'GET_RESOURCE':
      const observation = action.meta.observation;
      if (observation !== undefined) {
        path = observationPath({
          unitId: observation.unitId,
          property: observation.property});
        return Object.assign({}, _.omit(state, [path]));
      }
  }
  return state;
}

function updateFlushReducer(state = manuallyFlushUpdateQueue, action) {
  if (action.type === 'FLUSH_UPDATE_QUEUE') {
    return true;
  }
  else if (action.type === 'FLUSH_UPDATE_QUEUE_DISABLED') {
    return false;
  }
  return state;
}

function serviceGroupReducer(state = serviceGroup, action) {
  if (action.type === 'SELECT_SERVICE_GROUP') {
    return action.payload;
  }
  return state;
}

const userLocation = null;

function userLocationReducer(state = userLocation, action) {
  if (action.type === 'SET_USER_LOCATION') {
    return action.payload;
  }
  return state;
}


const unitsByUpdateTime = [];
function unitsByUpdateTimeReducer(state = unitsByUpdateTime, action) {
  if (action.type === 'POST_OBSERVATION') {
    if (action.error === true) return state;
    return _.uniq([].concat(action.meta.unitId, state)).slice(0, 20);
  }
  return state;
}

const unitsByUpdateCount = {};
function unitsByUpdateCountReducer(state = unitsByUpdateCount, action) {
  if (action.type === 'POST_OBSERVATION') {
    if (action.error === true) return state;
    const { unitId } = action.meta;
    const existingCount = (state[unitId] || {}).count || 0;
    const result = Object.assign({}, state, {[unitId]: {count: existingCount + 1, id: unitId}});
    return result;
  }
  return state;
}

export default combineReducers({
  data: dataReducer,
  auth: authReducer,
  updateQueue: pendingObservationsReducer,
  updateFlush: updateFlushReducer,
  serviceGroup: serviceGroupReducer,
  userLocation: userLocationReducer,
  unitsByUpdateTime: unitsByUpdateTimeReducer,
  unitsByUpdateCount: unitsByUpdateCountReducer
});

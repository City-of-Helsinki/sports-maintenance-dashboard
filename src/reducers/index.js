import { combineReducers } from 'redux';
import _ from 'lodash';

import MOCK_GROUPS from './mock_groups.js';

let initialDataState = {
  unit: {},
  group: MOCK_GROUPS,
  observable_property: {},
  observation: {},
  service: {}
};

let initialAuthState = {
  userName: null,
  apiToken: null
};

let initialPendingObservationsState = {
};

function dataReducer(state = initialDataState, action) {
  switch (action.type) {
    case 'GET_RESOURCE':
      const resourceType = action.meta.resourceType;
      return Object.assign(
        {}, state,
        {[resourceType]: Object.assign(
          state[resourceType],
          action.payload[resourceType])});
  }
  return state;
}

function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case 'LOGIN':
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

export default combineReducers({data: dataReducer, auth: authReducer, updateQueue: pendingObservationsReducer});

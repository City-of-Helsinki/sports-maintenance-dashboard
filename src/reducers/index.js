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
      return Object.assign({}, state, action.payload);
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

function createObservationData(action, status) {
  const { unitId, value, property, addServicedObservation } = action.payload;
  return {
    unitId,
    status,
    serviced: addServicedObservation,
    property,
    value: value
  };
}

function pendingObservationsReducer(state = initialPendingObservationsState, action) {
  let path = null;
  switch (action.type) {
    case 'ENQUEUE_OBSERVATION':
      path = observationPath(action.payload);
      return Object.assign({}, state, {[path]: createObservationData(action, 'enqueued')});
    case 'MARK_OBSERVATION_SENT':
      path = observationPath(action.payload);
      return Object.assign({}, state, {[path]: createObservationData(action, 'pending')});
  }
  return state;
}

export default combineReducers({data: dataReducer, auth: authReducer, updateQueue: pendingObservationsReducer});

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

let initialPendingObservationsState = [];

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

function pendingObservationsReducer(state = initialPendingObservationsState, action) {
  return state;
}

export default combineReducers({data: dataReducer, auth: authReducer});

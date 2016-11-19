import { combineReducers } from 'redux';
import _ from 'lodash';

let initialDataState = {
  unit: {},
  group: {},
  observable_property: {},
  observation: {},
  service: {}
};

let initialAuthState = {
  userName: null,
  apiToken: null
};

let initialPendingObservationsState = [];

function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case 'LOGIN':
  }
  return state;
}

function pendingObservationsReducer(state = initialPendingObservationsState, action) {
  return state;
}

export default combineReducers({data: dataReducer, auth: aauthReducer});

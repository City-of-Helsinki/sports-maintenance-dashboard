import { combineReducers } from 'redux';
import _ from 'lodash';

const MOCK_GROUPS = {
  'itä': {name: "Itä", units: [

  ]},
  'west': {name: "Länsi", units: [

  ]},
  'salmi': {name: "Salmi", units: [

  ]},
  'luukki': {name: "Luukki", units: [

  ]},
  'pirttimäki': {name: "Pirttimäki", units: [

  ]}
};

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

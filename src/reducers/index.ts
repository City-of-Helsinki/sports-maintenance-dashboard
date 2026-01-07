import { combineReducers, Action, AnyAction, Reducer } from 'redux';
import _ from 'lodash';

import { CredentialError } from '../util/error';
import {
  DataState,
  AuthState,
  AuthErrorState,
  PendingObservationsState,
  PendingObservationData,
  UnitsByUpdateCountState,
  RootState
} from './types';

// Specific Action Types extending Redux's base Action interface

interface GetResourceStartAction extends Action<'GET_RESOURCE_START'> {
  meta: {
    resourceType: string;
  };
}

interface GetResourceAction extends Action<'GET_RESOURCE'> {
  payload: {
    [key: string]: any;
  };
  meta: {
    resourceType: string;
    replaceAll?: boolean;
    observation?: {
      unitId: string;
      property: string;
    };
  };
}

interface GetNearestUnitsAction extends Action<'GET_NEAREST_UNITS'> {
  payload: any[];
}

interface LoginAction extends Action<'LOGIN'> {
  payload: {
    maintenance_organization: string;
    token: string;
    login_identifier: string;
  };
  error?: boolean;
}

interface ObservationAction extends Action<'ENQUEUE_OBSERVATION' | 'MARK_OBSERVATION_SENT' | 'MARK_OBSERVATION_RESENT'> {
  payload: {
    unitId: string;
    property: string;
    value: any;
    addServicedObservation?: boolean;
    serviced?: boolean;
  };
}

interface PostObservationAction extends Action<'POST_OBSERVATION'> {
  payload?: {
    unit: string;
    property: string;
  };
  meta: {
    unitId: string;
    property: string;
  };
  error?: boolean;
}

interface FlushUpdateQueueAction extends Action<'FLUSH_UPDATE_QUEUE' | 'FLUSH_UPDATE_QUEUE_DISABLED'> {
}

interface SelectServiceGroupAction extends Action<'SELECT_SERVICE_GROUP'> {
  payload: string;
}

interface SetUserLocationAction extends Action<'SET_USER_LOCATION'> {
  payload: any;
}

type ReduxAction = 
  | GetResourceStartAction
  | GetResourceAction
  | GetNearestUnitsAction
  | LoginAction
  | ObservationAction
  | PostObservationAction
  | FlushUpdateQueueAction
  | SelectServiceGroupAction
  | SetUserLocationAction
  | AnyAction;

const initialDataState: DataState = {
  unit: {},
  unitsByDistance: [],
  observable_property: {},
  observation: {},
  service: {},
  loading: {}
};

const initialAuthState: AuthState = {
  maintenance_organization: null,
  token: null,
  login_id: null
};

const initialAuthErrorState: AuthErrorState = null;

const initialPendingObservationsState: PendingObservationsState = {};

const manuallyFlushUpdateQueue: boolean = false;

const serviceGroup: string = 'skiing';

const dataReducer: Reducer<DataState, ReduxAction> = (state = initialDataState, action) => {
  switch (action.type) {
    case 'GET_RESOURCE_START': {
      const startResourceType = (action as GetResourceStartAction).meta.resourceType;
      return {
        ...state,
          loading: {
            ...state.loading,
            [startResourceType]: true
          }
      };
    }
    case 'GET_RESOURCE': {
      const resourceAction = action as GetResourceAction;
      const resourceType = resourceAction.meta.resourceType;
      let existingResources = state[resourceType as keyof DataState];
      if (resourceAction.meta.replaceAll === true) {
        existingResources = {};
      }
      return {
        ...state,
        [resourceType]: {
          ...existingResources,
          ...resourceAction.payload[resourceType]
        },
        loading: {
          ...state.loading,
          [resourceType]: false
        }
      };
    }
    case 'GET_NEAREST_UNITS':
      return {
        ...state,
        unitsByDistance: (action as GetNearestUnitsAction).payload
      };
  }
  return state;
};

const authErrorReducer: Reducer<AuthErrorState, ReduxAction> = (state = initialAuthErrorState, action) => {
  if (action.type === 'LOGIN' && action.error) {
    let payload: AuthErrorState = null;

    if (action.payload !== undefined) {
      if (action.payload.constructor === Object && Object.keys(action.payload).length > 0) {
        payload = action.payload;
      }
      else if (action.payload instanceof RangeError) {
        payload = {message: 'Kirjautuminen vaatii tunnuksen ja salasanan.'};
      }
      else if (action.payload instanceof CredentialError) {
        payload = {message: 'Kirjautuminen epäonnistui. Tarkista tunnus ja salasana.'};
      }
      else {
        payload = {message: 'Palvelimeen ei saatu yhteyttä tai tapahtui virhe.'};
      }
    }
    return payload;
  }
  return state;
};

const authReducer: Reducer<AuthState, ReduxAction> = (state = initialAuthState, action) => {
  switch (action.type) {
    case 'LOGIN': {
      const loginAction = action as LoginAction;
      if (loginAction.error) {
        return {
          token: null,
          maintenance_organization: null,
          login_id: null
        };
      }
      const {maintenance_organization, token, login_identifier} = loginAction.payload;
      if (!maintenance_organization || !token) {
        return {
          maintenance_organization,
          token,
          login_id: login_identifier
        };
      }
      return {
        maintenance_organization,
        token,
        login_id: login_identifier
      };
    }
  }
  return state;
}

function observationPath({unitId, property}: {unitId: string; property: string}): string {
  return `${unitId}.${property}`;
}

function createObservationData(
  payload: {
    unitId: string;
    value?: any;
    property: string;
    addServicedObservation?: boolean;
    serviced?: boolean;
  }, 
  status: string
): PendingObservationData {
  const { unitId, value, property, addServicedObservation, serviced } = payload;
  return {
    unitId,
    status,
    serviced: addServicedObservation || serviced || false,
    property,
    value: value || null
  };
}

const pendingObservationsReducer: Reducer<PendingObservationsState, ReduxAction> = (
  state = initialPendingObservationsState, 
  action
) => {
  let path: string | null = null;
  switch (action.type) {
    case 'ENQUEUE_OBSERVATION':
      path = observationPath((action as ObservationAction).payload);
      return Object.assign({}, state, {[path]: createObservationData((action as ObservationAction).payload, 'enqueued')});
    case 'MARK_OBSERVATION_SENT':
      path = observationPath((action as ObservationAction).payload);
      return Object.assign({}, state, {[path]: createObservationData((action as ObservationAction).payload, 'pending')});
    case 'MARK_OBSERVATION_RESENT':
      path = observationPath((action as ObservationAction).payload);
      return Object.assign({}, state, {[path]: createObservationData((action as ObservationAction).payload, 'retrying')});
    case 'POST_OBSERVATION': {
      const postAction = action as PostObservationAction;
      if (postAction.error) {
        path = observationPath(postAction.meta);
        return Object.assign({}, state, {[path]: createObservationData(postAction.meta, 'failed')});
      }
      if (postAction.payload) {
        path = observationPath({unitId: postAction.payload.unit, property: postAction.payload.property});
        return Object.assign({}, state, {[path]: createObservationData({unitId: postAction.payload.unit, property: postAction.payload.property}, 'success')});
      }
      break;
    }
    case 'GET_RESOURCE': {
      const resourceAction = action as GetResourceAction;
      const observation = resourceAction.meta.observation;
      if (observation !== undefined) {
        path = observationPath({
          unitId: observation.unitId,
          property: observation.property});
        return Object.assign({}, _.omit(state, [path]));
      }
      break;
    }
  }
  return state;
};

const updateFlushReducer: Reducer<boolean, ReduxAction> = (state = manuallyFlushUpdateQueue, action) => {
  if (action.type === 'FLUSH_UPDATE_QUEUE') {
    return true;
  }
  else if (action.type === 'FLUSH_UPDATE_QUEUE_DISABLED') {
    return false;
  }
  return state;
};

const serviceGroupReducer: Reducer<string, ReduxAction> = (state = serviceGroup, action) => {
  if (action.type === 'SELECT_SERVICE_GROUP') {
    return (action as SelectServiceGroupAction).payload;
  }
  return state;
};

const userLocation: any = null;

const userLocationReducer: Reducer<any, ReduxAction> = (state = userLocation, action) => {
  if (action.type === 'SET_USER_LOCATION') {
    return (action as SetUserLocationAction).payload;
  }
  return state;
};

const unitsByUpdateTime: string[] = [];
const unitsByUpdateTimeReducer: Reducer<string[], ReduxAction> = (state = unitsByUpdateTime, action) => {
  if (action.type === 'POST_OBSERVATION') {
    const postAction = action as PostObservationAction;
    
    if (postAction.error === true) {
        return state;
    }
    return _.uniq([].concat(postAction.meta.unitId, state)).slice(0, 20);
  }
  return state;
};

const unitsByUpdateCount: UnitsByUpdateCountState = {};
const unitsByUpdateCountReducer: Reducer<UnitsByUpdateCountState, ReduxAction> = (
  state = unitsByUpdateCount, 
  action
) => {
  if (action.type === 'POST_OBSERVATION') {
    const postAction = action as PostObservationAction;
    if (postAction.error === true) return state;
    const { unitId } = postAction.meta;
    const existingCount = (state[unitId] || {}).count || 0;
    const result = Object.assign({}, state, {[unitId]: {count: existingCount + 1, id: unitId}});
    return result;
  }
  return state;
};

export default combineReducers({
  data: dataReducer,
  auth: authReducer,
  authError: authErrorReducer,
  updateQueue: pendingObservationsReducer,
  updateFlush: updateFlushReducer,
  serviceGroup: serviceGroupReducer,
  userLocation: userLocationReducer,
  unitsByUpdateTime: unitsByUpdateTimeReducer,
  unitsByUpdateCount: unitsByUpdateCountReducer
});
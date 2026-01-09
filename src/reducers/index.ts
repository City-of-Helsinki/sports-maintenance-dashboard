import { combineReducers, Reducer } from 'redux';
import _ from 'lodash';

import { CredentialError } from '../util/error';
import { ActionTypes } from '../constants';
import {
  DataState,
  AuthState,
  AuthErrorState,
  PendingObservationsState,
  PendingObservationData,
  UnitsByUpdateCountState,
  ReduxAction
} from './types';
import { UserLocation } from 'types';

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
    case ActionTypes.GET_RESOURCE_START: {
      const startResourceType = action.meta.resourceType;
      
      return {
        ...state,
        loading: {
          ...state.loading,
          [startResourceType]: true
        }
      };
    }
    case ActionTypes.GET_RESOURCE: {
      const resourceAction = action;
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
    case ActionTypes.GET_NEAREST_UNITS:
      return {
        ...state,
        unitsByDistance: action.payload
      };
    default:
      return state;
  }
};

const authErrorReducer: Reducer<AuthErrorState, ReduxAction> = (state = initialAuthErrorState, action) => {
  if (action.type === ActionTypes.LOGIN && action.error) {
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
  if (action.type === ActionTypes.LOGIN) {
    const loginAction = action;
    if (loginAction.error) {
      return {
        token: null,
        maintenance_organization: null,
        login_id: null
      };
    }
    const {maintenance_organization, token, login_identifier} = loginAction.payload;
    
    return {
      maintenance_organization,
      token,
      login_id: login_identifier
    };
  }
  
  return state;
};

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
  switch (action.type) {
    case ActionTypes.ENQUEUE_OBSERVATION: {
      const path = observationPath(action.payload);
      return {
        ...state,
        [path]: createObservationData(action.payload, 'enqueued')
      };
    }
    case ActionTypes.MARK_OBSERVATION_SENT: {
      const path = observationPath(action.payload);
      return {
        ...state,
        [path]: createObservationData(action.payload, 'pending')
      };
    }
    case ActionTypes.MARK_OBSERVATION_RESENT: {
      const path = observationPath(action.payload);
      return {
        ...state,
        [path]: createObservationData(action.payload, 'retrying')
      };
    }
    case ActionTypes.POST_OBSERVATION: {
      const postAction = action;
      if (postAction.error) {
        const path = observationPath(postAction.meta);
        return {
          ...state,
          [path]: createObservationData(postAction.meta, 'failed')
        };
      }
      if (postAction.payload) {
        const path = observationPath({unitId: postAction.payload.unit, property: postAction.payload.property});
        return {
          ...state,
          [path]: createObservationData({unitId: postAction.payload.unit, property: postAction.payload.property}, 'success')
        };
      }
      return state;
    }
    case ActionTypes.GET_RESOURCE: {
      const resourceAction = action;
      const observation = resourceAction.meta.observation;
      if (observation !== undefined) {
        const path = observationPath({
          unitId: observation.unitId,
          property: observation.property
        });
        return _.omit(state, [path]);
      }
      return state;
    }
    default:
      return state;
  }
};

const updateFlushReducer: Reducer<boolean, ReduxAction> = (state = manuallyFlushUpdateQueue, action) => {
  switch (action.type) {
    case ActionTypes.FLUSH_UPDATE_QUEUE:
      return true;
    case ActionTypes.FLUSH_UPDATE_QUEUE_DISABLED:
      return false;
    default:
      return state;
  }
};

const serviceGroupReducer: Reducer<string, ReduxAction> = (state = serviceGroup, action) => {
  if (action.type === ActionTypes.SELECT_SERVICE_GROUP) {
    return action.payload;
  }
  
  return state;
};

const initialUserLocation: UserLocation | null = null;

const userLocationReducer: Reducer<UserLocation | null, ReduxAction> = (state = initialUserLocation, action) => {
  if (action.type === ActionTypes.SET_USER_LOCATION) {
    return action.payload;
  }
  
  return state;
};

const initialUnitsByUpdateTime: string[] = [];
const unitsByUpdateTimeReducer: Reducer<string[], ReduxAction> = (state = initialUnitsByUpdateTime, action) => {
  if (action.type === ActionTypes.POST_OBSERVATION) {
    const postAction = action;
    
    if (postAction.error === true) {
      return state;
    }
    
    return _.uniq([postAction.meta.unitId, ...state]).slice(0, 20);
  }
  
  return state;
};

const initialUnitsByUpdateCount: UnitsByUpdateCountState = {};
const unitsByUpdateCountReducer: Reducer<UnitsByUpdateCountState, ReduxAction> = (
  state = initialUnitsByUpdateCount,
  action
) => {
  if (action.type === ActionTypes.POST_OBSERVATION) {
    const postAction = action;

    if (postAction.error === true) {
      return state;
    }

    const { unitId } = postAction.meta;
    const existingCount = state[unitId]?.count || 0;
    
    return {
      ...state,
      [unitId]: { count: existingCount + 1, id: unitId }
    };
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

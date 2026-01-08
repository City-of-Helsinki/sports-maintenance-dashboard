import { Action, AnyAction } from 'redux';
import { ActionTypes } from '../constants';

// Redux store state types
// These types should match the structure defined in the reducers

// Action interface definitions

export interface GetResourceStartAction extends Action<typeof ActionTypes.GET_RESOURCE_START> {
  meta: {
    resourceType: string;
  };
}

export interface GetResourceAction extends Action<typeof ActionTypes.GET_RESOURCE> {
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

export interface GetNearestUnitsAction extends Action<typeof ActionTypes.GET_NEAREST_UNITS> {
  payload: any[];
}

export interface LoginAction extends Action<typeof ActionTypes.LOGIN> {
  payload: {
    maintenance_organization: string;
    token: string;
    login_identifier: string;
  };
  error?: boolean;
}

export type ObservationActionType = typeof ActionTypes.ENQUEUE_OBSERVATION | typeof ActionTypes.MARK_OBSERVATION_SENT | typeof ActionTypes.MARK_OBSERVATION_RESENT;

export interface ObservationAction extends Action<ObservationActionType> {
  payload: {
    unitId: string;
    property: string;
    value: any;
    addServicedObservation?: boolean;
    serviced?: boolean;
  };
}

export interface PostObservationAction extends Action<typeof ActionTypes.POST_OBSERVATION> {
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

export type FlushUpdateQueueActionType = typeof ActionTypes.FLUSH_UPDATE_QUEUE | typeof ActionTypes.FLUSH_UPDATE_QUEUE_DISABLED;

export interface FlushUpdateQueueAction extends Action<FlushUpdateQueueActionType> {
}

export interface SelectServiceGroupAction extends Action<typeof ActionTypes.SELECT_SERVICE_GROUP> {
  payload: string;
}

export interface SetUserLocationAction extends Action<typeof ActionTypes.SET_USER_LOCATION> {
  payload: any;
}

export type ReduxAction = 
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

// Common data interfaces
export interface LocalizedText {
  fi: string;
  sv?: string;
  en?: string;
}

export interface UnitExtensions {
  maintenance_group: string;
  maintenance_organization: string;
}

export interface UnitLocation {
  type: string;
  coordinates: [number, number];
}

export interface UnitObservation {
  unit: number;
  id: number;
  property: string;
  time: string;
  expiration_time: string | null;
  name: LocalizedText;
  quality: string;
  value?: LocalizedText | null;
  primary: boolean;
}

export interface Unit {
  id: number;
  name: LocalizedText;
  extensions: UnitExtensions;
  services: number[];
  address_postal_full: string | null;
  short_description: string | null;
  call_charge_info: LocalizedText;
  picture_caption: string | null;
  description: LocalizedText;
  www: LocalizedText;
  displayed_service_owner: LocalizedText;
  street_address: LocalizedText;
  location: UnitLocation;
  observations: UnitObservation[];
}

export interface AllowedValue {
  identifier: string;
  quality: string;
  name: LocalizedText;
  description: LocalizedText;
  property: string;
}

export interface ObservableProperty {
  id: string;
  name: LocalizedText;
  measurement_unit: string | null;
  observation_type: string;
  allowed_values: AllowedValue[];
}

export interface AuthState {
  maintenance_organization: string | null;
  token: string | null;
  login_id: string | null;
}

export interface DataState {
  unit: Record<string, Unit>;
  unitsByDistance: Unit[];
  observable_property: Record<string, ObservableProperty>;
  observation: Record<string, any>;
  service: Record<string, any>;
  loading: Record<string, boolean>;
}

export type AuthErrorState = {
  message?: string;
} | null;

export interface PendingObservationData {
  unitId: string;
  status: string;
  serviced: boolean;
  property: string;
  value: any;
}

export interface PendingObservationsState {
  [key: string]: PendingObservationData;
}

export interface UpdateCountData {
  count: number;
  id: string;
}

export interface UnitsByUpdateCountState {
  [unitId: string]: UpdateCountData;
}

// Main Redux store state interface
export interface RootState {
  data: DataState;
  auth: AuthState;
  authError: AuthErrorState;
  updateQueue: PendingObservationsState;  // Note: renamed from pendingObservations in actual store
  updateFlush: boolean;
  serviceGroup: string;
  userLocation: any | null;
  unitsByUpdateTime: string[];
  unitsByUpdateCount: UnitsByUpdateCountState;
}
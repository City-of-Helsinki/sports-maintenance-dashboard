// Redux store state types
// These types should match the structure defined in the reducers

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
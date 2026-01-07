// Redux store state types
// These types should match the structure defined in the reducers

export interface AuthState {
  maintenance_organization: string | null;
  token: string | null;
  login_id: string | null;
}

export interface DataState {
  unit: Record<string, any>;
  unitsByDistance: any[];
  observable_property: Record<string, any>;
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
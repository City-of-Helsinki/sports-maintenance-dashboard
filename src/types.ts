// Common data interfaces used throughout the application

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
  value?: LocalizedText | string | null;
  primary: boolean;
}

export interface Unit {
  id: number;
  name: LocalizedText;
  extensions?: UnitExtensions;
  services?: number[];
  address_postal_full: string | null;
  short_description?: LocalizedText | null;
  call_charge_info: LocalizedText;
  picture_caption?: string | null;
  description?: LocalizedText;
  www?: LocalizedText | null;
  displayed_service_owner: LocalizedText;
  street_address: LocalizedText;
  location?: UnitLocation;
  observations?: UnitObservation[];
  distance?: number;
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

// API response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UnitCount {
  municipality: Record<string, number>;
  organization: Record<string, number>;
  total: number;
}

export interface Service {
  id: number;
  name: LocalizedText;
  unit_count: UnitCount;
  observable_properties: ObservableProperty[];
}
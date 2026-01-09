// Type definitions for action payloads and metadata

export interface EnqueueObservationPayload {
  property: string;
  value: any;
  unitId: number;
  addServicedObservation: boolean;
}

export interface ResourceMeta {
  resourceType: string;
  replaceAll?: boolean;
  filters?: { [key: string]: any };
}

export interface ObservationMeta extends ResourceMeta {
  filters: { unit: string };
}

export interface PostObservationMeta {
  unitId: number;
  property: string;
  value: any;
}
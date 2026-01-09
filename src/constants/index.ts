interface ServiceGroup {
  services: number[];
  id: string;
  title: string;
}

interface ServiceGroups {
  skiing: ServiceGroup;
  iceSkating: ServiceGroup;
  swimming: ServiceGroup;
  sledding: ServiceGroup;
}

// Action type constants to avoid magic strings
export const ActionTypes = {
  GET_RESOURCE_START: 'GET_RESOURCE_START',
  GET_RESOURCE: 'GET_RESOURCE',
  GET_NEAREST_UNITS: 'GET_NEAREST_UNITS',
  LOGIN: 'LOGIN',
  ENQUEUE_OBSERVATION: 'ENQUEUE_OBSERVATION',
  MARK_OBSERVATION_SENT: 'MARK_OBSERVATION_SENT',
  MARK_OBSERVATION_RESENT: 'MARK_OBSERVATION_RESENT',
  POST_OBSERVATION: 'POST_OBSERVATION',
  FLUSH_UPDATE_QUEUE: 'FLUSH_UPDATE_QUEUE',
  FLUSH_UPDATE_QUEUE_DISABLED: 'FLUSH_UPDATE_QUEUE_DISABLED',
  SELECT_SERVICE_GROUP: 'SELECT_SERVICE_GROUP',
  SET_USER_LOCATION: 'SET_USER_LOCATION'
} as const;

export const SERVICE_GROUPS: ServiceGroups = {
  skiing: {
    services: [191, 318],
    id: 'skiing',
    title: 'Hiihtoladut'
  },
  iceSkating: {
    services: [514, 406, 235, 695, 407],
    id: 'iceSkating',
    title: 'Luistelukentät'
  },
  swimming: {
    services: [731, 730, 426],
    id: 'swimming',
    title: 'Uimarannat'
  },
  sledding: {
    services: [1083],
    id: 'sledding',
    title: 'Pulkkamäet'
  }
};

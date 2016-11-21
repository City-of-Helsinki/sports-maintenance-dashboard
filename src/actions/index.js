
import { createAction } from 'redux-actions';
import * as ApiClient from '../lib/municipal-services-client.js';

export const fetchUnitsWithServices = createAction(
    'GET_RESOURCE',
    ApiClient.fetchUnitsWithServices,
    () => {return { resourceType: 'unit' };});

export const fetchResource = createAction(
  'GET_RESOURCE',
  ApiClient.fetchResource,
  (resourceType) => {return { resourceType };}
);

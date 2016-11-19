
import { createAction } from 'redux-actions';
import * as ApiClient from '../lib/municipal-services-client.js'

export const fetchUnitsWithServices = createAction(
    'GET_RESOURCE',
    ApiClient.fetchUnitsWithServices,
    () => {return {resourceType: 'unit'};});

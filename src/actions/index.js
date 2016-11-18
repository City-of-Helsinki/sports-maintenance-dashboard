import { CALL_API } from 'redux-api-middleware';

require('process');
const API_BASE_URL = process.env.API_URL;

function getEndPoint(resourceType, id) {
  let base = `${API_BASE_URL}/${resourceType}/`;
  if (id) {
    return base + id;
  }
  return base;
}

export function fetch(resourceType, id) {
  return {
    [CALL_API]: {
      endpoint: getEndPoint(resourceType, id),
      method: 'GET',
      types: [
        {type: 'REQUEST', meta: { resourceType }},
        {type: 'SUCCESS', meta: { resourceType, multiple: false}},
        'FAILURE'
      ]
    }
  };
}

export function fetchUsers() {
  return {
    [CALL_API]: {
      endpoint: `${API_BASE_URL}/user/`,
      method: 'GET',
      types: [
        {type: 'REQUEST', meta: { resourceType: 'user' }},
        {type: 'SUCCESS', meta: { resourceType: 'user', multiple: true}},
        'FAILURE'
      ]
    }
  };
}

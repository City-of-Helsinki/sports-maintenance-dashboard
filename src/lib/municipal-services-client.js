import URI from 'urijs';
import _ from 'lodash';

require('process');
const API_BASE_URL = process.env.API_URL;

function resourceEndpoint(resourceType) {
  return `${API_BASE_URL}/${resourceType}/`;
}

function filteredUrl(url, filters) {
  if (filters === null || filters === undefined) {
    return url;
  }
  return URI(url).addSearch(filters).toString();
}

function selectFields(url, selected, embedded) {
  let uri = URI(url);
  if (selected !== null && selected !== undefined) {
    uri = uri.addSearch({only: selected.join(',')});
  }
  if (embedded !== null && embedded !== undefined) {
    uri = uri.addSearch({include: embedded.join(',')});
  }
  return uri.toString();
};

function preProcessResponse(resourceType) {
  return function (obj) {
    return {[resourceType]: _.keyBy(obj.results, 'id')};
  };
};

export function fetchResource(resourceType, filters=null, selected=null, embedded=null) {
  const url = resourceEndpoint(resourceType);
  // TODO: pagination
  return fetch(
    selectFields(
      filteredUrl(url, filters),
      selected,
      embedded)).then((response) => {
        return response.json();
      }).then(
        preProcessResponse(resourceType)
      );
}

export function postResource(resourceType, payload, credentials) {
  if (credentials === null || credentials === undefined) {
    throw new Error('Credentials needed for API write access.');
  }
  return fetch(resourceEndpoint(resourceType), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// concrete use cases

export function fetchUnitsWithServices(services, {selected, embedded}) {
  const serviceParameter = services.join(',');
  return fetchResource('unit', {service: serviceParameter}, selected, embedded);
}

window.fetchResource = fetchResource;

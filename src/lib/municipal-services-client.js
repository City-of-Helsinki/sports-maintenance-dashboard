import URI from 'urijs';
import _ from 'lodash';

import { CredentialError } from '../util/error';

require('process');
const API_BASE_URL = process.env.API_URL;

function resourceEndpoint(resourceType) {
  return `${API_BASE_URL}/${resourceType}/`;
}

function filteredUrl(url, filters, pageSize) {
  let uri = URI(url);
  uri.addSearch({page_size: pageSize || 1000});
  uri.addSearch({freshen: (new Date()).getTime()});
  if (filters === null || filters === undefined) {
    return uri.toString();
  }
  return uri.addSearch(filters).toString();
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
}

function preProcessResponse(resourceType, preprocess) {
  if (preprocess) {
    return function (obj) {
      return {[resourceType]: _.keyBy(obj.results, 'id')};
    };
  }
  return (obj) => {
    return obj.results; };
}

export function fetchResource(resourceType, filters=null, selected=null, embedded=null, pageSize=null, options={preprocess: true}) {
  const url = resourceEndpoint(resourceType);
 // TODO: pagination
  return fetch(
    selectFields(
      filteredUrl(url, filters, pageSize),
      selected,
      embedded)).then((response) => {
        return response.json();
      }).then(
        preProcessResponse(resourceType, options.preprocess)
      );
}

export function postResource(resourceType, payload, token) {
  if (token === null || token === undefined) {
    throw new Error('Token needed for API write access.');
  }
  return fetch(resourceEndpoint(resourceType), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  }).then((response) => {
    return response.json();
  });
}

// concrete use cases

export function login(username, password) {
  if (!username || username === '' ||
      !password || password === '') {
    return new RangeError('Credentials needed for API login.');
  }
  return fetch(resourceEndpoint('api-token-auth'), {
    method: 'POST',
    body: JSON.stringify(
      {username, password}
    ),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new CredentialError('Authentication failed. Please check the username and password.');
    }
    return response.json();
  });
}

export function fetchUnitsWithServices(services, maintenance_organization, {selected, embedded}) {
  const serviceParameter = services.join(',');
  return fetchResource('unit', {service: serviceParameter, maintenance_organization }, selected, embedded);
}

export function postObservation(specification, token) {
  return postResource(
    'observation',
    {unit: specification.unitId, value: specification.value, property: specification.property, serviced: specification.serviced},
    token
  );
}

// utility functions

export function unitObservableProperties(unit, services, qualityObservationsOnly=false) {
  if (unit === null || unit === undefined) {
    return [];
  }
  const unitServices = _.map(unit.services, (id) => {
    return services[id]; });
  const reducer = (collection, element) => {
    let observableProperties = _.filter(element.observable_properties, (property) => {
      return property.observation_type == 'categorical';
    });

    if (qualityObservationsOnly) {
      observableProperties = _.filter(
        observableProperties, (property) => {
          return (
            property.observation_type != 'categorical' ||
            // There must be at least one allowedValue
            // with a quality specified
            undefined !== _.find(property.allowed_values, (value) => {
              return value.quality != 'unknown';
            }));});
    }
    if (observableProperties.length > 0) {
      return collection.concat(observableProperties);
    }
    return collection;
  };
  return _.reduce(unitServices, reducer, []);
}

export function getNearestUnits(position, services, maintenance_organization) {
  const serviceParameter = services.join(',');
  return fetchResource(
    'unit',
    {lat: position.coords.latitude,
     lon: position.coords.longitude,
     service: serviceParameter,
     maintenance_organization}, ['id', 'name'], null, 5,
    {preprocess: false});
}

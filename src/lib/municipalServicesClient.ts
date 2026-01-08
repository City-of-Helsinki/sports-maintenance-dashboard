import URI from "urijs";
import _ from "lodash";

import { CredentialError } from "../util/error";
import {
  Unit,
  ObservableProperty,
  AllowedValue,
  Service,
  UnitObservation,
} from "../types";

require("process");
const API_BASE_URL = process.env.API_URL;

// Type definitions
interface FetchOptions {
  preprocess?: boolean;
}

interface LoginResponse {
  token: string;
  login_identifier: string;
  maintenance_organization: string;
}

interface ObservationSpecification {
  unitId: number;
  value: any;
  property: string;
  serviced: boolean;
}

interface Position {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface ServicesMap {
  [key: number]: Service;
}

interface UnitObservationMap {
  [key: number]: UnitObservation;
}

interface UnitMap {
  [key: number]: Unit;
}

interface FetchUnitsOptions {
  selected?: string[];
  embedded?: string[];
}

function resourceEndpoint(resourceType: string): string {
  return `${API_BASE_URL}/${resourceType}/`;
}

function filteredUrl(
  url: string,
  filters: Record<string, any> | null,
  pageSize?: number | null,
): string {
  let uri = URI(url);
  uri.addSearch({ page_size: pageSize || 1000 });
  uri.addSearch({ freshen: new Date().getTime() });
  if (filters === null || filters === undefined) {
    return uri.toString();
  }
  return uri.addSearch(filters).toString();
}

function selectFields(
  url: string,
  selected: string[] | null,
  embedded: string[] | null,
): string {
  let uri = URI(url);
  if (selected !== null && selected !== undefined) {
    uri = uri.addSearch({ only: selected.join(",") });
  }
  if (embedded !== null && embedded !== undefined) {
    uri = uri.addSearch({ include: embedded.join(",") });
  }
  return uri.toString();
}

function preProcessResponse<T>(resourceType: string, preprocess: boolean) {
  if (preprocess) {
    return function (obj: { results: T[] }): {
      [key: string]: { [id: string]: T };
    } {
      return { [resourceType]: _.keyBy(obj.results, "id") };
    };
  }
  return (obj: { results: T[] }): T[] => {
    return obj.results;
  };
}

// Function overloads for different preprocessing options
export function fetchResource<T = any>(
  resourceType: string,
  filters: Record<string, any> | null,
  selected: string[] | null,
  embedded: string[] | null,
  pageSize: number | null,
  options: FetchOptions & { preprocess: false },
): Promise<T[]>;

export function fetchResource<T = any>(
  resourceType: string,
  filters: Record<string, any> | null,
  selected: string[] | null,
  embedded: string[] | null,
  pageSize: number | null,
  options?: FetchOptions & { preprocess?: true },
): Promise<{ [key: string]: { [id: string]: T } }>;

export function fetchResource<T = any>(
  resourceType: string,
  filters: Record<string, any> | null = null,
  selected: string[] | null = null,
  embedded: string[] | null = null,
  pageSize: number | null = null,
  options: FetchOptions = { preprocess: true },
): Promise<T[] | { [key: string]: { [id: string]: T } }> {
  const url = resourceEndpoint(resourceType);
  // TODO: pagination
  return fetch(
    selectFields(filteredUrl(url, filters, pageSize), selected, embedded),
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return preProcessResponse<T>(
        resourceType,
        options.preprocess ?? true,
      )(data);
    });
}

export function postResource<T = any>(
  resourceType: string,
  payload: Record<string, any>,
  token: string,
): Promise<T> {
  if (token === null || token === undefined) {
    throw new Error("Token needed for API write access.");
  }
  return fetch(resourceEndpoint(resourceType), {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  }).then((response) => {
    return response.json();
  });
}

// concrete use cases

export function login(
  username: string,
  password: string,
): Promise<LoginResponse> | RangeError {
  if (!username || username === "" || !password || password === "") {
    return new RangeError("Credentials needed for API login.");
  }
  return fetch(resourceEndpoint("api-token-auth"), {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new CredentialError(
        "Authentication failed. Please check the username and password.",
      );
    }
    return response.json();
  });
}

export function fetchUnitsWithServices(
  services: number[],
  maintenance_organization: string,
  options: FetchUnitsOptions,
): Promise<UnitMap> {
  const serviceParameter = services.join(",");
  return fetchResource(
    "unit",
    { service: serviceParameter, maintenance_organization },
    options.selected,
    options.embedded,
    null,
  ) as unknown as Promise<UnitMap>;
}

export function fetchUnitObservations(
  unitId: string,
  selected?: string[],
  embedded?: string[],
): Promise<UnitObservationMap> {
  return fetchResource(
    "observation",
    { unit: unitId },
    selected,
    embedded,
    null,
  ) as unknown as Promise<UnitObservationMap>;
}

export function postObservation(
  specification: ObservationSpecification,
  token: string,
): Promise<any> {
  return postResource(
    "observation",
    {
      unit: specification.unitId,
      value: specification.value,
      property: specification.property,
      serviced: specification.serviced,
    },
    token,
  );
}

// utility functions

export function unitObservableProperties(
  unit: Unit | null | undefined,
  services: ServicesMap,
  qualityObservationsOnly: boolean = false,
): ObservableProperty[] {
  if (unit === null || unit === undefined) {
    return [];
  }
  const unitServices = _.compact(
    _.map(unit.services, (id: number) => {
      return services[id];
    }),
  );
  const reducer = (
    collection: ObservableProperty[],
    element: Service,
  ): ObservableProperty[] => {
    let observableProperties = _.filter(
      element.observable_properties,
      (property: ObservableProperty) => {
        return property.observation_type === "categorical";
      },
    );

    if (qualityObservationsOnly) {
      observableProperties = _.filter(
        observableProperties,
        (property: ObservableProperty) => {
          return (
            property.observation_type !== "categorical" ||
            // There must be at least one allowedValue
            // with a quality specified
            undefined !==
              _.find(property.allowed_values, (value: AllowedValue) => {
                return value.quality !== "unknown";
              })
          );
        },
      );
    }
    if (observableProperties.length > 0) {
      return collection.concat(observableProperties);
    }
    return collection;
  };
  return _.reduce(unitServices, reducer, []);
}

export function getNearestUnits(
  position: Position,
  services: number[],
  maintenance_organization: string,
): Promise<Unit[]> {
  const serviceParameter = services.join(",");
  return fetchResource(
    "unit",
    {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      service: serviceParameter,
      maintenance_organization,
    },
    ["id", "name"],
    null,
    5,
    { preprocess: false },
  );
}

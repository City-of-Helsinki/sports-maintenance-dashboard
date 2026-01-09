/*eslint no-console: 0*/
'use strict';

import { CredentialError } from '../../util/error';
import * as municipalClient from '../municipalServicesClient';
import { Unit } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('municipalServicesClient utility functions', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // No cleanup needed since API_URL is set globally
  });

  describe('fetchResource', () => {
    it('should make correct API call and return processed data', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockData = {
        results: [
          { id: 1, name: 'Unit 1' },
          { id: 2, name: 'Unit 2' }
        ]
      };
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockData)
      } as Response);

      const result = await municipalClient.fetchResource('units', null, null, null, null, { preprocess: true });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://test-api.example.com/api/units/')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page_size=1000')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('freshen=')
      );
      expect(result).toEqual({
        units: {
          1: { id: 1, name: 'Unit 1' },
          2: { id: 2, name: 'Unit 2' }
        }
      });
    });

    it('should add filters to URL when provided', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ results: [] })
      } as Response);

      const filters = { service: '1,2,3', maintenance_organization: 'test-org' };
      await municipalClient.fetchResource('units', filters, null, null, null, { preprocess: false });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('service=1%2C2%2C3')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('maintenance_organization=test-org')
      );
    });

    it('should add selected and embedded fields to URL', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ results: [] })
      } as Response);

      await municipalClient.fetchResource('units', null, ['id', 'name'], ['services'], null, { preprocess: false });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('only=id%2Cname')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('include=services')
      );
    });

    it('should use custom page size when provided', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ results: [] })
      } as Response);

      await municipalClient.fetchResource('units', null, null, null, 50, { preprocess: false });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page_size=50')
      );
    });

    it('should return raw results array when preprocess is false', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockData = {
        results: [
          { id: 1, name: 'Unit 1' },
          { id: 2, name: 'Unit 2' }
        ]
      };
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockData)
      } as Response);

      const result = await municipalClient.fetchResource('units', null, null, null, null, { preprocess: false });
      
      expect(result).toEqual([
        { id: 1, name: 'Unit 1' },
        { id: 2, name: 'Unit 2' }
      ]);
    });

    it('should default to preprocessing when options parameter is omitted', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockData = {
        results: [
          { id: 1, name: 'Unit 1' },
          { id: 2, name: 'Unit 2' }
        ]
      };
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockData)
      } as Response);

      const result = await municipalClient.fetchResource('units');
      
      expect(result).toEqual({
        units: {
          1: { id: 1, name: 'Unit 1' },
          2: { id: 2, name: 'Unit 2' }
        }
      });
    });
  });

  describe('login', () => {
    it('should return RangeError for empty credentials', () => {
      const result1 = municipalClient.login('', 'password');
      const result2 = municipalClient.login('username', '');
      const result3 = municipalClient.login('', '');
      
      expect(result1).toBeInstanceOf(RangeError);
      expect(result2).toBeInstanceOf(RangeError);
      expect(result3).toBeInstanceOf(RangeError);
    });

    it('should return RangeError for null/undefined credentials', () => {
      const result1 = municipalClient.login(null as any, 'password');
      const result2 = municipalClient.login('username', null as any);
      const result3 = municipalClient.login(undefined as any, 'password');
      const result4 = municipalClient.login('username', undefined as any);
      
      expect(result1).toBeInstanceOf(RangeError);
      expect(result2).toBeInstanceOf(RangeError);
      expect(result3).toBeInstanceOf(RangeError);
      expect(result4).toBeInstanceOf(RangeError);
    });

    it('should make correct API call for valid credentials', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockResponse = {
        token: 'test-token-123',
        login_identifier: 'testuser',
        maintenance_organization: 'test-org'
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await expect(municipalClient.login('testuser', 'testpass'))
        .resolves
        .toEqual(mockResponse);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api-token-auth/'),
        {
          method: 'POST',
          body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should throw CredentialError for authentication failure', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({})
      } as Response);

      await expect(municipalClient.login('testuser', 'wrongpass'))
        .rejects
        .toThrow(CredentialError as any);
    });
  });

  describe('postResource', () => {
    it('should throw error when token is missing', () => {
      expect(() => municipalClient.postResource('observation', {}, null as any))
        .toThrow('Token needed for API write access.');
        
      expect(() => municipalClient.postResource('observation', {}, undefined as any))
        .toThrow('Token needed for API write access.');
    });

    it('should make correct POST request with token', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockResponse = { id: 123, created: true };
      const payload = { unit: 1, value: 'good', property: 'condition' };
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await municipalClient.postResource('observation', payload, 'test-token');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/observation/'),
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token test-token'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('postObservation', () => {
    it('should post observation with correct format', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockResponse = { id: 456 };
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const specification = {
        unitId: 123,
        value: 'excellent',
        property: 'surface_condition',
        serviced: true
      };

      const result = await municipalClient.postObservation(specification, 'test-token');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/observation/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            unit: 123,
            value: 'excellent',
            property: 'surface_condition',
            serviced: true
          }),
          headers: expect.objectContaining({
            Authorization: 'Token test-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('fetchUnitsWithServices', () => {
    it('should fetch units with correct service parameters', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockResponse = { results: [{ id: 1, name: 'Unit 1' }] };
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const services = [1, 2, 3];
      const maintenanceOrg = 'test-org';
      const options = { selected: ['id', 'name'], embedded: ['services'] };

      await municipalClient.fetchUnitsWithServices(services, maintenanceOrg, options);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('service=1%2C2%2C3')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('maintenance_organization=test-org')
      );
    });
  });

  describe('fetchUnitObservations', () => {
    it('should fetch observations for specific unit', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockResponse = { results: [{ id: 1, value: 'good' }] };
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await municipalClient.fetchUnitObservations('123', ['id', 'value'], ['unit']);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('unit=123')
      );
    });
  });

  describe('getNearestUnits', () => {
    it('should fetch units with location parameters', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      const mockResponse = {
        results: [
          { id: 1, name: 'Nearest Unit 1' },
          { id: 2, name: 'Nearest Unit 2' }
        ]
      };
      
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const position = {
        coords: {
          latitude: 60.1695,
          longitude: 24.9354
        }
      };

      const result = await municipalClient.getNearestUnits(position, [1, 2], 'test-org');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=60.1695')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lon=24.9354')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('service=1%2C2')
      );
      expect(result).toEqual(mockResponse.results);
    });
  });

  describe('unitObservableProperties', () => {
    it('should return empty array for null or undefined unit', () => {
      const services = {};
      
      const result1 = municipalClient.unitObservableProperties(null, services);
      const result2 = municipalClient.unitObservableProperties(undefined, services);
      
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('should return observable properties from unit services', () => {
      const unit: Unit = {
        id: 1,
        name: { fi: 'Test Unit', sv: 'Test Enhet', en: 'Test Unit' },
        services: [1, 2],
        address_postal_full: 'Test Address',
        call_charge_info: { fi: 'No charge', sv: 'Ingen avgift', en: 'No charge' },
        displayed_service_owner: { fi: 'Test Owner', sv: 'Test Ägare', en: 'Test Owner' },
        street_address: { fi: 'Test Street', sv: 'Test Gata', en: 'Test Street' },
        location: { type: 'Point', coordinates: [24.9354, 60.1695] }
      };

      const services = {
        1: {
          id: 1,
          name: { fi: 'Service 1', sv: 'Tjänst 1', en: 'Service 1' },
          unit_count: { municipality: {}, organization: {}, total: 0 },
          observable_properties: [
            {
              id: '1',
              name: { fi: 'condition', sv: 'skick', en: 'condition' },
              measurement_unit: null,
              observation_type: 'categorical',
              allowed_values: [
                {
                  identifier: 'good',
                  name: { fi: 'good', sv: 'bra', en: 'good' },
                  description: { fi: 'Good condition', sv: 'Bra skick', en: 'Good condition' },
                  quality: 'good',
                  property: 'condition'
                },
                {
                  identifier: 'poor',
                  name: { fi: 'poor', sv: 'dålig', en: 'poor' },
                  description: { fi: 'Poor condition', sv: 'Dåligt skick', en: 'Poor condition' },
                  quality: 'poor',
                  property: 'condition'
                }
              ]
            }
          ]
        },
        2: {
          id: 2,
          name: { fi: 'Service 2', sv: 'Tjänst 2', en: 'Service 2' },
          unit_count: { municipality: {}, organization: {}, total: 0 },
          observable_properties: [
            {
              id: '2',
              name: { fi: 'cleanliness', sv: 'renlighet', en: 'cleanliness' },
              measurement_unit: null,
              observation_type: 'categorical',
              allowed_values: [
                {
                  identifier: 'clean',
                  name: { fi: 'clean', sv: 'ren', en: 'clean' },
                  description: { fi: 'Clean', sv: 'Ren', en: 'Clean' },
                  quality: 'good',
                  property: 'cleanliness'
                }
              ]
            }
          ]
        }
      };

      const result = municipalClient.unitObservableProperties(unit, services);
      
      // The function should return observable properties from both services
      expect(result).toHaveLength(2);
    });

    it('should filter for quality observations only when requested', () => {
      const unit: Unit = {
        id: 1,
        name: { fi: 'Test Unit', sv: 'Test Enhet', en: 'Test Unit' },
        services: [1],
        address_postal_full: 'Test Address',
        call_charge_info: { fi: 'No charge', sv: 'Ingen avgift', en: 'No charge' },
        displayed_service_owner: { fi: 'Test Owner', sv: 'Test Ägare', en: 'Test Owner' },
        street_address: { fi: 'Test Street', sv: 'Test Gata', en: 'Test Street' },
        location: { type: 'Point', coordinates: [24.9354, 60.1695] }
      };

      const services = {
        1: {
          id: 1,
          name: { fi: 'Service 1', sv: 'Tjänst 1', en: 'Service 1' },
          unit_count: { municipality: {}, organization: {}, total: 0 },
          observable_properties: [
            {
              id: '1',
              name: { fi: 'condition', sv: 'skick', en: 'condition' },
              measurement_unit: null,
              observation_type: 'categorical',
              allowed_values: [
                {
                  identifier: 'unknown',
                  name: { fi: 'unknown', sv: 'okänd', en: 'unknown' },
                  description: { fi: 'Unknown', sv: 'Okänd', en: 'Unknown' },
                  quality: 'unknown',
                  property: 'condition'
                },
                {
                  identifier: 'poor',
                  name: { fi: 'poor', sv: 'dålig', en: 'poor' },
                  description: { fi: 'Poor condition', sv: 'Dåligt skick', en: 'Poor condition' },
                  quality: 'poor',
                  property: 'condition'
                }
              ]
            }
          ]
        }
      };

      const result = municipalClient.unitObservableProperties(unit, services, true);
      
      // Should include properties that have at least one non-unknown quality value
      expect(result).toHaveLength(1);
    });

    it('should handle non-categorical observation types', () => {
      const unit: Unit = {
        id: 1,
        name: { fi: 'Test Unit', sv: 'Test Enhet', en: 'Test Unit' },
        services: [1],
        address_postal_full: 'Test Address',
        call_charge_info: { fi: 'No charge', sv: 'Ingen avgift', en: 'No charge' },
        displayed_service_owner: { fi: 'Test Owner', sv: 'Test Ägare', en: 'Test Owner' },
        street_address: { fi: 'Test Street', sv: 'Test Gata', en: 'Test Street' },
        location: { type: 'Point', coordinates: [24.9354, 60.1695] }
      };

      const services = {
        1: {
          id: 1,
          name: { fi: 'Service 1', sv: 'Tjänst 1', en: 'Service 1' },
          unit_count: { municipality: {}, organization: {}, total: 0 },
          observable_properties: [
            {
              id: '1',
              name: { fi: 'temperature', sv: 'temperatur', en: 'temperature' },
              measurement_unit: '°C',
              observation_type: 'numeric',
              allowed_values: []
            }
          ]
        }
      };

      const result = municipalClient.unitObservableProperties(unit, services);
      
      // Should filter out non-categorical properties
      expect(result).toEqual([]);
    });

    it('should handle units with no services', () => {
      const unit: Unit = {
        id: 1,
        name: { fi: 'Test Unit', sv: 'Test Enhet', en: 'Test Unit' },
        services: [],
        address_postal_full: 'Test Address',
        call_charge_info: { fi: 'No charge', sv: 'Ingen avgift', en: 'No charge' },
        displayed_service_owner: { fi: 'Test Owner', sv: 'Test Ägare', en: 'Test Owner' },
        street_address: { fi: 'Test Street', sv: 'Test Gata', en: 'Test Street' },
        location: { type: 'Point', coordinates: [24.9354, 60.1695] }
      };

      const services = {};
      
      const result = municipalClient.unitObservableProperties(unit, services);
      
      expect(result).toEqual([]);
    });
  });
});
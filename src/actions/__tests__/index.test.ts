import * as actions from '../index';
import * as ApiClient from '../../lib/municipal-services-client';
import { ActionTypes } from '../../constants';
import { AllowedValue } from '../../reducers/types';

describe('Action Creators', () => {
  // Store original fetch to restore it after tests
  const originalFetch = globalThis.fetch;
  
  beforeAll(() => {
    // Mock fetch for all tests in this suite
    globalThis.fetch = jest.fn();
  });
  
  afterAll(() => {
    // Restore original fetch to prevent leaking to other tests
    globalThis.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis.fetch as jest.Mock).mockClear();
  });

  describe('setResourceFetchStart', () => {
    it('should create GET_RESOURCE_START action with correct type and payload', () => {
      const resourceType = 'unit';
      const action = actions.setResourceFetchStart(resourceType);
      
      expect(action.type).toBe(ActionTypes.GET_RESOURCE_START);
      expect(action.payload).toBe(resourceType);
      expect(action.meta).toEqual({ resourceType });
    });

    it('should work with different resource types', () => {
      const resourceTypes = ['unit', 'observation', 'service'];
      
      resourceTypes.forEach(resourceType => {
        const action = actions.setResourceFetchStart(resourceType);
        expect(action.payload).toBe(resourceType);
        expect(action.meta).toEqual({ resourceType });
      });
    });
  });

  describe('fetchUnitsWithServices', () => {
    it('should create GET_RESOURCE action with correct meta and async payload', async () => {
      const mockServices = [1, 2, 3];
      const mockOrganization = 'test-org';
      const mockOptions = { selected: ['id', 'name'] };
      
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [{ id: 1, name: 'Test Unit' }] })
      });

      const action = actions.fetchUnitsWithServices(mockServices, mockOrganization, mockOptions);
      
      expect(action.type).toBe(ActionTypes.GET_RESOURCE);
      expect(action.meta).toEqual({
        resourceType: 'unit',
        replaceAll: true
      });
      expect(action.payload).toBeInstanceOf(Promise);
      
      // Test the async payload resolves correctly - real API processes it into an object
      const result = await action.payload;
      expect(result).toEqual({ unit: { 1: { id: 1, name: 'Test Unit' } } });
      
      // Verify fetch was called with correct URL structure
      const [fetchUrl] = (fetch as jest.Mock).mock.calls[0];
      expect(fetchUrl).toContain('/unit/');
      expect(fetchUrl).toContain('service=1%2C2%2C3');
      expect(fetchUrl).toContain('maintenance_organization=test-org');
    });
  });

  describe('fetchResource', () => {
    it('should create GET_RESOURCE action with basic parameters', async () => {
      const resourceType = 'observation';
      
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [{ id: 1, property: 'status' }] })
      });

      const action = actions.fetchResource(resourceType);
      
      expect(action.type).toBe(ActionTypes.GET_RESOURCE);
      expect(action.meta).toEqual({ resourceType });
      expect(action.payload).toBeInstanceOf(Promise);
      
      const result = await action.payload;
      expect(result).toEqual({ observation: { 1: { id: 1, property: 'status' } } });
      
      // Verify fetch was called with correct URL structure
      const [fetchUrl] = (fetch as jest.Mock).mock.calls[0];
      expect(fetchUrl).toContain('/observation/');
      expect(fetchUrl).toContain('page_size=1000');
    });

    it('should create action with meta parameters', async () => {
      const resourceType = 'unit';
      const filters = { status: 'active' };
      const include = ['services'];
      const embed = ['observations'];
      const meta = { customProp: 'test' };
      
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [{ id: 1, name: 'Test Unit' }] })
      });

      const action = actions.fetchResource(resourceType, filters, include, embed, meta);
      
      expect(action.type).toBe(ActionTypes.GET_RESOURCE);
      expect(action.meta.resourceType).toBe(resourceType);
      expect(action.payload).toBeInstanceOf(Promise);
      
      const result = await action.payload;
      expect(result).toEqual({ unit: { 1: { id: 1, name: 'Test Unit' } } });
      
      // Verify fetch was called with filtered URL including all parameters
      const [fetchUrl] = (fetch as jest.Mock).mock.calls[0];
      expect(fetchUrl).toContain('/unit/');
      expect(fetchUrl).toContain('status=active');
      expect(fetchUrl).toContain('only=services');
      expect(fetchUrl).toContain('include=observations');
    });
  });

  describe('fetchUnitObservations', () => {
    it('should create GET_RESOURCE action for observations', async () => {
      const unitId = '123';
      
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [{ id: 1, unit: unitId, property: 'status' }] })
      });

      const action = actions.fetchUnitObservations(unitId);
      
      expect(action.type).toBe(ActionTypes.GET_RESOURCE);
      expect(action.meta).toEqual({
        resourceType: 'observation',
        filters: { unit: unitId }
      });
      expect(action.payload).toBeInstanceOf(Promise);
      
      const result = await action.payload;
      expect(result).toEqual({ observation: { 1: { id: 1, unit: unitId, property: 'status' } } });
      
      // Verify fetch was called with unit filter
      const [fetchUrl] = (fetch as jest.Mock).mock.calls[0];
      expect(fetchUrl).toContain('/observation/');
      expect(fetchUrl).toContain('unit=123');
    });
  });

  describe('getNearestUnits', () => {
    it('should create GET_NEAREST_UNITS action', async () => {
      const position = { coords: { latitude: 60.1699, longitude: 24.9384 } };
      const services = [1, 2];
      const organization = 'helsinki';
      
      // Mock the fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [{ id: 1, name: 'Nearest Unit' }] })
      });

      const action = (actions.getNearestUnits as any)(position, services, organization);
      
      expect(action.type).toBe(ActionTypes.GET_NEAREST_UNITS);
      expect(action.payload).toBeInstanceOf(Promise);
      
      // getNearestUnits returns raw results (not processed)
      const result = await action.payload;
      expect(result).toEqual([{ id: 1, name: 'Nearest Unit' }]);
      
      // Verify fetch was called with location and service parameters
      const [fetchUrl] = (fetch as jest.Mock).mock.calls[0];
      expect(fetchUrl).toContain('/unit/');
      expect(fetchUrl).toContain('lat=60.1699');
      expect(fetchUrl).toContain('lon=24.9384');
      expect(fetchUrl).toContain('service=1%2C2');
      expect(fetchUrl).toContain('maintenance_organization=helsinki');
    });
  });

  describe('login', () => {
    it('should create LOGIN action and call API with username', async () => {
      const username = 'validuser';
      const password = 'validpass';
      
      // Mock successful fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          token: 'test-token', 
          login_identifier: 'validuser', 
          maintenance_organization: 'test-org' 
        })
      });

      const action = (actions.login as any)(username, password);
      
      expect(action.type).toBe(ActionTypes.LOGIN);
      expect(action.payload).toBeInstanceOf(Promise);
      
      // Wait for the promise and check the result
      const result = await action.payload;
      expect(result).toEqual({ 
        token: 'test-token', 
        login_identifier: 'validuser', 
        maintenance_organization: 'test-org' 
      });
      
      // Verify fetch was called with login endpoint
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api-token-auth/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username, password }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle login validation errors', () => {
      const username = '';
      const password = 'password';

      const action = (actions.login as any)(username, password);
      
      expect(action.type).toBe(ActionTypes.LOGIN);
      
      // For validation errors, the real function returns the error directly (not a promise)
      expect(action.payload).toBeInstanceOf(RangeError);
      expect((action.payload as RangeError).message).toBe('Credentials needed for API login.');
      
      // Should not make any fetch call for validation errors
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle authentication failures', async () => {
      const username = 'invaliduser';
      const password = 'wrongpass';
      
      // Mock failed fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const action = (actions.login as any)(username, password);
      
      expect(action.type).toBe(ActionTypes.LOGIN);
      expect(action.payload).toBeInstanceOf(Promise);
      
      // Should reject with authentication error
      await expect(action.payload).rejects.toThrow('Authentication failed. Please check the username and password.');
      
      // Verify fetch was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api-token-auth/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username, password })
        })
      );
    });

    it('should pass both username and password to real login function', async () => {
      const username = 'testuser';
      const password = 'testpass';
      
      // Mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token' })
      });

      await (actions.login as any)(username, password).payload;
      
      // Verify that both username and password were sent in the request body
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api-token-auth/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username, password })
        })
      );
    });
  });

  describe('enqueueObservation', () => {
    it('should create ENQUEUE_OBSERVATION action', () => {
      const property = 'status';
      const value = 'open';
      const unitId = '123';
      
      const action = actions.enqueueObservation(property, value, unitId);
      
      expect(action.type).toBe(ActionTypes.ENQUEUE_OBSERVATION);
      // Test that the action has the expected structure, regardless of how redux-actions structures it
      expect(action).toHaveProperty('type', ActionTypes.ENQUEUE_OBSERVATION);
      expect(action).toHaveProperty('payload');
    });

    it('should process AllowedValue objects', () => {
      const property = 'condition';
      const value: AllowedValue = {
        identifier: 'good',
        quality: 'excellent',
        name: { fi: 'Hyvä' },
        description: { fi: 'Kunto on hyvä' },
        property: 'condition'
      };
      const unitId = '456';
      const addServicedObservation = true;
      
      const action = (actions.enqueueObservation as any)(property, value, unitId, addServicedObservation);
      
      expect(action.type).toBe(ActionTypes.ENQUEUE_OBSERVATION);
      expect(action).toHaveProperty('payload');
    });

    it('should be callable with parameters', () => {
      // Test that the function can be called without throwing
      expect(() => actions.enqueueObservation('test', 'value', '123')).not.toThrow();
      expect(() => (actions.enqueueObservation as any)('test', 'value', '123', true)).not.toThrow();
    });
  });

  describe('Simple action creators', () => {
    it('should create markObservationSent action', () => {
      const payload = { unitId: '123', property: 'status' };
      const action = actions.markObservationSent(payload);
      expect(action.type).toBe(ActionTypes.MARK_OBSERVATION_SENT);
      expect(action.payload).toBe(payload);
    });

    it('should create markObservationResent action', () => {
      const payload = { unitId: '456', property: 'condition' };
      const action = actions.markObservationResent(payload);
      expect(action.type).toBe(ActionTypes.MARK_OBSERVATION_RESENT);
      expect(action.payload).toBe(payload);
    });

    it('should create retryImmediately action', () => {
      const action = actions.retryImmediately();
      expect(action.type).toBe(ActionTypes.FLUSH_UPDATE_QUEUE);
    });

    it('should create finishRetryImmediately action', () => {
      const action = actions.finishRetryImmediately();
      expect(action.type).toBe(ActionTypes.FLUSH_UPDATE_QUEUE_DISABLED);
    });

    it('should create selectServiceGroup action', () => {
      const serviceGroup = 'skiing';
      const action = actions.selectServiceGroup(serviceGroup);
      expect(action.type).toBe(ActionTypes.SELECT_SERVICE_GROUP);
      expect(action.payload).toBe(serviceGroup);
    });

    it('should create setUserLocation action', () => {
      const location = { lat: 60.1699, lng: 24.9384 };
      const action = actions.setUserLocation(location);
      expect(action.type).toBe(ActionTypes.SET_USER_LOCATION);
      expect(action.payload).toBe(location);
    });
  });

  describe('sendObservation', () => {
    it('should create POST_OBSERVATION action', async () => {
      const specification = { unitId: '123', property: 'status', value: 'open', serviced: false };
      const token = 'auth-token';
      
      // Mock successful fetch response
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve({ id: 1, unit: '123', property: 'status', value: 'open' })
      });

      const action = actions.sendObservation(specification, token);
      
      expect(action.type).toBe(ActionTypes.POST_OBSERVATION);
      expect(action.meta).toBe(specification);
      expect(action.payload).toBeInstanceOf(Promise);
      
      const result = await action.payload;
      expect(result).toEqual({ id: 1, unit: '123', property: 'status', value: 'open' });
      
      // Verify fetch was called with POST method and token
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/observation/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            unit: specification.unitId,
            value: specification.value,
            property: specification.property,
            serviced: specification.serviced
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        })
      );
    });
  });

  describe('Action type constants', () => {
    it('should use correct action types', () => {
      expect(ActionTypes.GET_RESOURCE_START).toBe('GET_RESOURCE_START');
      expect(ActionTypes.GET_RESOURCE).toBe('GET_RESOURCE');
      expect(ActionTypes.GET_NEAREST_UNITS).toBe('GET_NEAREST_UNITS');
      expect(ActionTypes.LOGIN).toBe('LOGIN');
      expect(ActionTypes.ENQUEUE_OBSERVATION).toBe('ENQUEUE_OBSERVATION');
      expect(ActionTypes.MARK_OBSERVATION_SENT).toBe('MARK_OBSERVATION_SENT');
      expect(ActionTypes.MARK_OBSERVATION_RESENT).toBe('MARK_OBSERVATION_RESENT');
      expect(ActionTypes.POST_OBSERVATION).toBe('POST_OBSERVATION');
      expect(ActionTypes.FLUSH_UPDATE_QUEUE).toBe('FLUSH_UPDATE_QUEUE');
      expect(ActionTypes.FLUSH_UPDATE_QUEUE_DISABLED).toBe('FLUSH_UPDATE_QUEUE_DISABLED');
      expect(ActionTypes.SELECT_SERVICE_GROUP).toBe('SELECT_SERVICE_GROUP');
      expect(ActionTypes.SET_USER_LOCATION).toBe('SET_USER_LOCATION');
    });
  });
});
import reducer from '../index';
import { CredentialError } from '../../util/error';

describe('Reducers', () => {
  const initialState = {
    data: {
      unit: {},
      unitsByDistance: [],
      observable_property: {},
      observation: {},
      service: {},
      loading: {}
    },
    auth: {
      maintenance_organization: null,
      token: null,
      login_id: null
    },
    authError: null,
    updateQueue: {},
    updateFlush: false,
    serviceGroup: 'skiing',
    userLocation: null,
    unitsByUpdateTime: [],
    unitsByUpdateCount: {}
  };

  describe('dataReducer', () => {
    it('should handle GET_RESOURCE_START', () => {
      const action = {
        type: 'GET_RESOURCE_START',
        meta: { resourceType: 'unit' }
      };
      const state = reducer(initialState, action);
      
      expect(state.data.loading.unit).toBe(true);
    });

    it('should handle GET_RESOURCE', () => {
      const action = {
        type: 'GET_RESOURCE',
        meta: { resourceType: 'unit' },
        payload: {
          unit: {
            '1': { id: '1', name: 'Test Unit' }
          }
        }
      };
      const state = reducer(initialState, action);
      
      expect(state.data.unit['1']).toEqual({ id: '1', name: 'Test Unit' });
      expect(state.data.loading.unit).toBe(false);
    });

    it('should handle GET_RESOURCE with replaceAll flag', () => {
      const existingState = {
        ...initialState,
        data: {
          ...initialState.data,
          unit: { '1': { id: '1', name: 'Existing Unit' } }
        }
      };

      const action = {
        type: 'GET_RESOURCE',
        meta: { resourceType: 'unit', replaceAll: true },
        payload: {
          unit: {
            '2': { id: '2', name: 'New Unit' }
          }
        }
      };
      const state = reducer(existingState, action);
      
      expect(state.data.unit).toEqual({ '2': { id: '2', name: 'New Unit' } });
      expect(state.data.unit['1']).toBeUndefined();
    });

    it('should handle GET_NEAREST_UNITS', () => {
      const action = {
        type: 'GET_NEAREST_UNITS',
        payload: [{ id: '1', distance: 100 }]
      };
      const state = reducer(initialState, action);
      
      expect(state.data.unitsByDistance).toEqual([{ id: '1', distance: 100 }]);
    });
  });

  describe('authReducer', () => {
    it('should handle successful LOGIN', () => {
      const action = {
        type: 'LOGIN',
        payload: {
          maintenance_organization: 'test-org',
          token: 'test-token',
          login_identifier: 'test-user'
        }
      };
      const state = reducer(initialState, action);
      
      expect(state.auth).toEqual({
        maintenance_organization: 'test-org',
        token: 'test-token',
        login_id: 'test-user'
      });
    });

    it('should handle failed LOGIN', () => {
      const action = {
        type: 'LOGIN',
        error: true,
        payload: new Error('Login failed')
      };
      const state = reducer(initialState, action);
      
      expect(state.auth).toEqual({
        token: null,
        maintenance_organization: null,
        login_id: null
      });
    });

    it('should handle incomplete LOGIN data', () => {
      const action = {
        type: 'LOGIN',
        payload: {
          maintenance_organization: 'test-org',
          // missing token
          login_identifier: 'test-user'
        }
      };
      const state = reducer(initialState, action);
      
      expect(state.auth.token).toBeUndefined();
      expect(state.auth.maintenance_organization).toBe('test-org');
    });
  });

  describe('authErrorReducer', () => {
    it('should handle LOGIN error with object payload', () => {
      const action = {
        type: 'LOGIN',
        error: true,
        payload: { message: 'Custom error message' }
      };
      const state = reducer(initialState, action);
      
      expect(state.authError).toEqual({ message: 'Custom error message' });
    });

    it('should handle LOGIN error with RangeError', () => {
      const action = {
        type: 'LOGIN',
        error: true,
        payload: new RangeError('Range error')
      };
      const state = reducer(initialState, action);
      
      expect(state.authError).toEqual({ message: 'Kirjautuminen vaatii tunnuksen ja salasanan.' });
    });

    it('should handle LOGIN error with CredentialError', () => {
      const action = {
        type: 'LOGIN',
        error: true,
        payload: new CredentialError('Invalid credentials')
      };
      const state = reducer(initialState, action);
      
      expect(state.authError).toEqual({ message: 'Kirjautuminen epäonnistui. Tarkista tunnus ja salasana.' });
    });

    it('should handle LOGIN error with generic error', () => {
      const action = {
        type: 'LOGIN',
        error: true,
        payload: new Error('Generic error')
      };
      const state = reducer(initialState, action);
      
      expect(state.authError).toEqual({ message: 'Palvelimeen ei saatu yhteyttä tai tapahtui virhe.' });
    });

    it('should clear auth error on successful action', () => {
      const action = {
        type: 'LOGIN',
        payload: {
          maintenance_organization: 'test-org',
          token: 'test-token',
          login_identifier: 'test-user'
        }
      };
      const state = reducer(initialState, action);
      
      expect(state.authError).toBeNull();
    });
  });

  describe('pendingObservationsReducer', () => {
    const observationPayload = {
      unitId: 'unit-1',
      property: 'condition',
      value: 'good',
      serviced: true
    };

    it('should handle ENQUEUE_OBSERVATION', () => {
      const action = {
        type: 'ENQUEUE_OBSERVATION',
        payload: observationPayload
      };
      const state = reducer(initialState, action);
      
      expect(state.updateQueue['unit-1.condition']).toEqual({
        unitId: 'unit-1',
        status: 'enqueued',
        serviced: true,
        property: 'condition',
        value: 'good'
      });
    });

    it('should handle MARK_OBSERVATION_SENT', () => {
      const action = {
        type: 'MARK_OBSERVATION_SENT',
        payload: observationPayload
      };
      const state = reducer(initialState, action);
      
      expect(state.updateQueue['unit-1.condition'].status).toBe('pending');
    });

    it('should handle MARK_OBSERVATION_RESENT', () => {
      const action = {
        type: 'MARK_OBSERVATION_RESENT',
        payload: observationPayload
      };
      const state = reducer(initialState, action);
      
      expect(state.updateQueue['unit-1.condition'].status).toBe('retrying');
    });

    it('should handle successful POST_OBSERVATION', () => {
      const action = {
        type: 'POST_OBSERVATION',
        payload: {
          unit: 'unit-1',
          property: 'condition'
        },
        meta: {
          unitId: 'unit-1'
        }
      };
      const state = reducer(initialState, action);
      
      expect(state.updateQueue['unit-1.condition'].status).toBe('success');
    });

    it('should handle failed POST_OBSERVATION', () => {
      const action = {
        type: 'POST_OBSERVATION',
        error: true,
        meta: observationPayload
      };
      const state = reducer(initialState, action);
      
      expect(state.updateQueue['unit-1.condition'].status).toBe('failed');
    });

    it('should handle GET_RESOURCE with observation meta', () => {
      const stateWithPendingObs = {
        ...initialState,
        updateQueue: {
          'unit-1.condition': { status: 'pending' }
        }
      };

      const action = {
        type: 'GET_RESOURCE',
        meta: {
          resourceType: 'observation',
          observation: {
            unitId: 'unit-1',
            property: 'condition'
          }
        },
        payload: { observation: {} }
      };
      const state = reducer(stateWithPendingObs, action);
      
      expect(state.updateQueue['unit-1.condition']).toBeUndefined();
    });
  });

  describe('updateFlushReducer', () => {
    it('should handle FLUSH_UPDATE_QUEUE', () => {
      const action = { type: 'FLUSH_UPDATE_QUEUE' };
      const state = reducer(initialState, action);
      
      expect(state.updateFlush).toBe(true);
    });

    it('should handle FLUSH_UPDATE_QUEUE_DISABLED', () => {
      const action = { type: 'FLUSH_UPDATE_QUEUE_DISABLED' };
      const state = reducer(initialState, action);
      
      expect(state.updateFlush).toBe(false);
    });
  });

  describe('serviceGroupReducer', () => {
    it('should handle SELECT_SERVICE_GROUP', () => {
      const action = {
        type: 'SELECT_SERVICE_GROUP',
        payload: 'ice-skating'
      };
      const state = reducer(initialState, action);
      
      expect(state.serviceGroup).toBe('ice-skating');
    });

    it('should default to skiing', () => {
      expect(initialState.serviceGroup).toBe('skiing');
    });
  });

  describe('userLocationReducer', () => {
    it('should handle SET_USER_LOCATION', () => {
      const location = { lat: 60.1699, lng: 24.9384 };
      const action = {
        type: 'SET_USER_LOCATION',
        payload: location
      };
      const state = reducer(initialState, action);
      
      expect(state.userLocation).toEqual(location);
    });
  });

  describe('unitsByUpdateTimeReducer', () => {
    it('should handle successful POST_OBSERVATION', () => {
      const action = {
        type: 'POST_OBSERVATION',
        meta: { unitId: 'unit-1' },
        payload: { unit: 'unit-1', property: 'condition' }
      };
      const state = reducer(initialState, action);
      
      expect(state.unitsByUpdateTime).toEqual(['unit-1']);
    });

    it('should not handle failed POST_OBSERVATION', () => {
      const action = {
        type: 'POST_OBSERVATION',
        error: true,
        meta: { unitId: 'unit-1' }
      };
      const state = reducer(initialState, action);
      
      expect(state.unitsByUpdateTime).toEqual([]);
    });

    it('should maintain unique units and limit to 20', () => {
      const stateWith19Units = {
        ...initialState,
        unitsByUpdateTime: Array.from({ length: 19 }, (_, i) => `unit-${i}`)
      };

      const action = {
        type: 'POST_OBSERVATION',
        meta: { unitId: 'unit-new' },
        payload: { unit: 'unit-new', property: 'condition' }
      };
      const state = reducer(stateWith19Units, action);
      
      expect(state.unitsByUpdateTime).toHaveLength(20);
      expect(state.unitsByUpdateTime[0]).toBe('unit-new');
    });

    it('should not duplicate units', () => {
      const stateWithUnit = {
        ...initialState,
        unitsByUpdateTime: ['unit-1', 'unit-2']
      };

      const action = {
        type: 'POST_OBSERVATION',
        meta: { unitId: 'unit-1' },
        payload: { unit: 'unit-1', property: 'condition' }
      };
      const state = reducer(stateWithUnit, action);
      
      expect(state.unitsByUpdateTime).toEqual(['unit-1', 'unit-2']);
      expect(state.unitsByUpdateTime).toHaveLength(2);
    });
  });

  describe('unitsByUpdateCountReducer', () => {
    it('should handle first POST_OBSERVATION for unit', () => {
      const action = {
        type: 'POST_OBSERVATION',
        meta: { unitId: 'unit-1' },
        payload: { unit: 'unit-1', property: 'condition' }
      };
      const state = reducer(initialState, action);
      
      expect(state.unitsByUpdateCount['unit-1']).toEqual({
        count: 1,
        id: 'unit-1'
      });
    });

    it('should increment count for existing unit', () => {
      const stateWithCount = {
        ...initialState,
        unitsByUpdateCount: {
          'unit-1': { count: 2, id: 'unit-1' }
        }
      };

      const action = {
        type: 'POST_OBSERVATION',
        meta: { unitId: 'unit-1' },
        payload: { unit: 'unit-1', property: 'condition' }
      };
      const state = reducer(stateWithCount, action);
      
      expect(state.unitsByUpdateCount['unit-1']).toEqual({
        count: 3,
        id: 'unit-1'
      });
    });

    it('should not handle failed POST_OBSERVATION', () => {
      const action = {
        type: 'POST_OBSERVATION',
        error: true,
        meta: { unitId: 'unit-1' }
      };
      const state = reducer(initialState, action);
      
      expect(state.unitsByUpdateCount).toEqual({});
    });
  });

  describe('combined reducer', () => {
    it('should return initial state for unknown action', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const state = reducer(undefined, action);
      
      expect(state).toEqual(initialState);
    });

    it('should handle multiple actions affecting different reducers', () => {
      let state = reducer(initialState, {
        type: 'SELECT_SERVICE_GROUP',
        payload: 'ice-skating'
      });

      state = reducer(state, {
        type: 'SET_USER_LOCATION',
        payload: { lat: 60.1699, lng: 24.9384 }
      });

      state = reducer(state, {
        type: 'LOGIN',
        payload: {
          maintenance_organization: 'test-org',
          token: 'test-token',
          login_identifier: 'test-user'
        }
      });

      expect(state.serviceGroup).toBe('ice-skating');
      expect(state.userLocation).toEqual({ lat: 60.1699, lng: 24.9384 });
      expect(state.auth.token).toBe('test-token');
    });
  });
});
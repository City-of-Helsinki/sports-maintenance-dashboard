import _ from 'lodash';
import queueHandler from '../queueHandler';
import {
  markObservationSent,
  markObservationResent,
  sendObservation,
  fetchResource,
  finishRetryImmediately
} from '../index';
import { RootState } from '../../reducers/types';

// Mock the action creators
jest.mock('../index', () => ({
  markObservationSent: jest.fn(),
  markObservationResent: jest.fn(),
  sendObservation: jest.fn(),
  fetchResource: jest.fn(),
  finishRetryImmediately: jest.fn()
}));

// Mock lodash delay
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  delay: jest.fn()
}));

const mockActions = {
  markObservationSent: markObservationSent as jest.MockedFunction<typeof markObservationSent>,
  markObservationResent: markObservationResent as jest.MockedFunction<typeof markObservationResent>,
  sendObservation: sendObservation as jest.MockedFunction<typeof sendObservation>,
  fetchResource: fetchResource as jest.MockedFunction<typeof fetchResource>,
  finishRetryImmediately: finishRetryImmediately as jest.MockedFunction<typeof finishRetryImmediately>
};

const mockDelay = _.delay as jest.MockedFunction<typeof _.delay>;

describe('queueHandler', () => {
  let mockStore: any;
  let mockDispatch: jest.MockedFunction<any>;
  let mockGetState: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    mockDispatch = jest.fn();
    mockGetState = jest.fn();
    
    mockStore = {
      dispatch: mockDispatch,
      getState: mockGetState
    };

    // Mock return values for action creators
    mockActions.markObservationSent.mockReturnValue({
      type: 'MARK_OBSERVATION_SENT',
      payload: undefined
    });
    mockActions.markObservationResent.mockReturnValue({
      type: 'MARK_OBSERVATION_RESENT',
      payload: undefined
    });
    mockActions.sendObservation.mockReturnValue({
      type: 'SEND_OBSERVATION',
      meta: undefined,
      payload: undefined
    });
    mockActions.fetchResource.mockReturnValue({
      type: 'FETCH_RESOURCE',
      meta: undefined,
      payload: undefined
    });
    mockActions.finishRetryImmediately.mockReturnValue({
      type: 'FINISH_RETRY_IMMEDIATELY',
      payload: undefined
    });

    // Mock delay to return a timer ID
    mockDelay.mockReturnValue(123);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('basic functionality', () => {
    it('should return a function when called with store', () => {
      const handler = queueHandler(mockStore);
      expect(typeof handler).toBe('function');
    });

    it('should handle empty queue', () => {
      mockGetState.mockReturnValue({
        updateQueue: [],
        auth: { token: 'test-token' },
        updateFlush: false
      } as unknown as Partial<RootState>);

      const handler = queueHandler(mockStore);
      handler();

      // Should not dispatch any actions for empty queue
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('enqueued items handling', () => {
    it('should mark and send enqueued items', () => {
      const enqueuedItem = {
        id: '1',
        status: 'enqueued' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [enqueuedItem],
        auth: { token: 'test-token' },
        updateFlush: false
      } as unknown as Partial<RootState>);

      const handler = queueHandler(mockStore);
      handler();

      expect(mockActions.markObservationSent).toHaveBeenCalledWith(enqueuedItem);
      expect(mockActions.sendObservation).toHaveBeenCalledWith(enqueuedItem, 'test-token');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'MARK_OBSERVATION_SENT' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SEND_OBSERVATION' });
    });

    it('should handle multiple enqueued items', () => {
      const enqueuedItems = [
        { id: '1', status: 'enqueued' as const, unitId: 'unit-1' },
        { id: '2', status: 'enqueued' as const, unitId: 'unit-2' }
      ];

      mockGetState.mockReturnValue({
        updateQueue: enqueuedItems,
        auth: { token: 'test-token' },
        updateFlush: false
      } as unknown as Partial<RootState>);

      const handler = queueHandler(mockStore);
      handler();

      expect(mockActions.markObservationSent).toHaveBeenCalledTimes(2);
      expect(mockActions.sendObservation).toHaveBeenCalledTimes(2);
    });
  });

  describe('failed items retry logic', () => {
    it('should schedule delayed retry for failed items by default', () => {
      const failedItem = {
        id: '1',
        status: 'failed' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [failedItem],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler();

      expect(mockActions.markObservationResent).toHaveBeenCalledWith(failedItem);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'MARK_OBSERVATION_RESENT' });
      expect(mockDelay).toHaveBeenCalledWith(expect.any(Function), 15000, mockStore, failedItem);
    });

    it('should retry failed items immediately when initial=true', () => {
      const failedItem = {
        id: '1',
        status: 'failed' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [failedItem],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler({ initial: true });

      expect(mockActions.sendObservation).toHaveBeenCalledWith(failedItem, 'test-token');
      expect(mockActions.finishRetryImmediately).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SEND_OBSERVATION' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'FINISH_RETRY_IMMEDIATELY' });
    });

    it('should retry failed items immediately when updateFlush is true', () => {
      const failedItem = {
        id: '1',
        status: 'failed' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [failedItem],
        auth: { token: 'test-token' },
        updateFlush: true
      } as unknown as Partial<RootState>);

      const handler = queueHandler(mockStore);
      handler();

      expect(mockActions.sendObservation).toHaveBeenCalledWith(failedItem, 'test-token');
      expect(mockActions.finishRetryImmediately).toHaveBeenCalled();
    });

    it('should handle retrying items immediately', () => {
      const retryingItem = {
        id: '1',
        status: 'retrying' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [retryingItem],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler({ initial: true });

      expect(mockActions.sendObservation).toHaveBeenCalledWith(retryingItem, 'test-token');
    });
  });

  describe('success items handling', () => {
    it('should fetch resource for successful items', () => {
      const successItem = {
        id: '1',
        status: 'success' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [successItem],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler();

      expect(mockActions.fetchResource).toHaveBeenCalledWith(
        'unit',
        { id: 'unit-1' },
        ['id', 'name', 'services', 'extensions'],
        ['observations'],
        { observation: successItem }
      );
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'FETCH_RESOURCE' });
    });
  });

  describe('timer management', () => {
    beforeEach(() => {
      // Mock clearTimeout
      global.clearTimeout = jest.fn();
    });

    it('should clear existing timers when retrying immediately', () => {
      const failedItem = {
        id: '1',
        status: 'failed' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [failedItem],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      
      // First call to create timer
      handler();
      expect(mockDelay).toHaveBeenCalledTimes(1);

      // Second call with immediate retry should clear timers
      handler({ initial: true });
      expect(global.clearTimeout).toHaveBeenCalledWith(123);
    });

    it('should manage multiple timers correctly', () => {
      const failedItems = [
        { id: '1', status: 'failed' as const, unitId: 'unit-1' },
        { id: '2', status: 'failed' as const, unitId: 'unit-2' }
      ];

      mockDelay
        .mockReturnValueOnce(123)
        .mockReturnValueOnce(456);

      mockGetState.mockReturnValue({
        updateQueue: failedItems,
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler();

      expect(mockDelay).toHaveBeenCalledTimes(2);

      // Should clear both timers on immediate retry
      handler({ initial: true });
      expect(global.clearTimeout).toHaveBeenCalledWith(123);
      expect(global.clearTimeout).toHaveBeenCalledWith(456);
    });
  });

  describe('mixed queue scenarios', () => {
    it('should handle mixed queue with different statuses', () => {
      const mixedQueue = [
        { id: '1', status: 'enqueued' as const, unitId: 'unit-1' },
        { id: '2', status: 'failed' as const, unitId: 'unit-2' },
        { id: '3', status: 'success' as const, unitId: 'unit-3' },
        { id: '4', status: 'retrying' as const, unitId: 'unit-4' }
      ];

      mockGetState.mockReturnValue({
        updateQueue: mixedQueue,
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler();

      // Should handle enqueued item
      expect(mockActions.markObservationSent).toHaveBeenCalledWith(mixedQueue[0]);
      expect(mockActions.sendObservation).toHaveBeenCalledWith(mixedQueue[0], 'test-token');

      // Should handle failed item with delayed retry
      expect(mockActions.markObservationResent).toHaveBeenCalledWith(mixedQueue[1]);
      expect(mockDelay).toHaveBeenCalledWith(expect.any(Function), 15000, mockStore, mixedQueue[1]);

      // Should handle success item
      expect(mockActions.fetchResource).toHaveBeenCalledWith(
        'unit',
        { id: 'unit-3' },
        ['id', 'name', 'services', 'extensions'],
        ['observations'],
        { observation: mixedQueue[2] }
      );

      // Retrying item should not be processed in normal mode
      expect(mockActions.sendObservation).not.toHaveBeenCalledWith(mixedQueue[3], 'test-token');
    });

    it('should handle mixed queue with immediate retry', () => {
      const mixedQueue = [
        { id: '1', status: 'enqueued' as const, unitId: 'unit-1' },
        { id: '2', status: 'failed' as const, unitId: 'unit-2' },
        { id: '3', status: 'success' as const, unitId: 'unit-3' },
        { id: '4', status: 'retrying' as const, unitId: 'unit-4' }
      ];

      mockGetState.mockReturnValue({
        updateQueue: mixedQueue,
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      handler({ initial: true });

      // Should handle enqueued item normally
      expect(mockActions.markObservationSent).toHaveBeenCalledWith(mixedQueue[0]);

      // Should retry failed and retrying items immediately
      expect(mockActions.sendObservation).toHaveBeenCalledWith(mixedQueue[1], 'test-token');
      expect(mockActions.sendObservation).toHaveBeenCalledWith(mixedQueue[3], 'test-token');

      // Should handle success item
      expect(mockActions.fetchResource).toHaveBeenCalledWith(
        'unit',
        { id: 'unit-3' },
        ['id', 'name', 'services', 'extensions'],
        ['observations'],
        { observation: mixedQueue[2] }
      );

      // Should finish retry immediately
      expect(mockActions.finishRetryImmediately).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined options', () => {
      mockGetState.mockReturnValue({
        updateQueue: [],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      
      expect(() => {
        handler(undefined);
      }).not.toThrow();
    });

    it('should handle queue items without unitId', () => {
      const itemWithoutUnitId = {
        id: '1',
        status: 'success' as const
        // Missing unitId
      };

      mockGetState.mockReturnValue({
        updateQueue: [itemWithoutUnitId],
        auth: { token: 'test-token' },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      
      expect(() => {
        handler();
      }).not.toThrow();

      expect(mockActions.fetchResource).toHaveBeenCalledWith(
        'unit',
        { id: undefined },
        ['id', 'name', 'services', 'extensions'],
        ['observations'],
        { observation: itemWithoutUnitId }
      );
    });

    it('should handle missing auth token', () => {
      const enqueuedItem = {
        id: '1',
        status: 'enqueued' as const,
        unitId: 'unit-1'
      };

      mockGetState.mockReturnValue({
        updateQueue: [enqueuedItem],
        auth: { token: undefined },
        updateFlush: false
      });

      const handler = queueHandler(mockStore);
      
      expect(() => {
        handler();
      }).not.toThrow();

      expect(mockActions.sendObservation).toHaveBeenCalledWith(enqueuedItem, undefined);
    });
  });
});
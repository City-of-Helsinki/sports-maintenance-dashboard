// Mock navigator.geolocation globally
const mockGetCurrentPosition = jest.fn();

// Set up geolocation mock
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: mockGetCurrentPosition
  },
  configurable: true,
  writable: true
});

import { getInitialLocation } from '../geolocation';

// Mock position object
const mockPosition: GeolocationPosition = {
  coords: {
    latitude: 60.1699,
    longitude: 24.9384,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: jest.fn()
  },
  timestamp: Date.now(),
  toJSON: jest.fn()
};

// Mock error object
const mockError: GeolocationPositionError = {
  code: 1,
  message: 'Permission denied',
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3
};

describe('geolocation utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentPosition.mockClear();
    mockGetCurrentPosition.mockReset();
  });

  describe('getInitialLocation', () => {
    describe('when geolocation is supported', () => {
      it('should call navigator.geolocation.getCurrentPosition with initial stage options', () => {
        const mockCallback = jest.fn();
        
        getInitialLocation(mockCallback);

        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
        expect(mockGetCurrentPosition).toHaveBeenCalledWith(
          expect.any(Function), // success callback
          expect.any(Function), // error callback
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: Infinity
          }
        );
      });

      it('should call the callback when position is received', () => {
        const mockCallback = jest.fn();
        
        mockGetCurrentPosition.mockImplementation((success) => {
          success(mockPosition);
        });

        getInitialLocation(mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(mockPosition);
      });

      it('should progress to next stage after successful position', () => {
        const mockCallback = jest.fn();
        
        // Stop after first success to avoid infinite recursion
        mockGetCurrentPosition.mockImplementationOnce((success) => {
          success(mockPosition);
        });

        getInitialLocation(mockCallback);

        // Should be called twice: initial call + recursive call for next stage
        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
        
        // Check that different options are used for second call
        const secondCall = mockGetCurrentPosition.mock.calls[1];
        expect(secondCall[2]).toEqual({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 0
        });
      });

      it('should progress through multiple stages', () => {
        const mockCallback = jest.fn();
        let callCount = 0;
        
        // Allow progression through 3 stages, then stop
        mockGetCurrentPosition.mockImplementation((success) => {
          callCount++;
          if (callCount <= 3) {
            success(mockPosition);
          }
        });

        getInitialLocation(mockCallback);

        // Should progress through initial, cacheSuccess, and lowAccuracySuccess
        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(3);
        expect(mockCallback).toHaveBeenCalledTimes(3);
        
        // Verify the third call uses high accuracy settings
        const thirdCall = mockGetCurrentPosition.mock.calls[2];
        expect(thirdCall[2]).toEqual({
          enableHighAccuracy: true,
          timeout: Infinity,
          maximumAge: 0
        });
      });

      it('should reset stage when reset parameter is true (default)', () => {
        const mockCallback = jest.fn();
        
        // First call - don't trigger success to avoid stage progression
        getInitialLocation(mockCallback);
        
        // Clear mocks to check second call behavior
        mockGetCurrentPosition.mockClear();
        
        // Second call with default reset=true
        getInitialLocation(mockCallback);

        // Should start from initial stage again
        expect(mockGetCurrentPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: Infinity
          }
        );
      });

      it('should handle error callback without throwing', () => {
        const mockCallback = jest.fn();
        
        mockGetCurrentPosition.mockImplementation((success, error) => {
          error(mockError);
        });

        expect(() => {
          getInitialLocation(mockCallback);
        }).not.toThrow();
        
        // Callback should not be called on error
        expect(mockCallback).not.toHaveBeenCalled();
      });

      it('should handle successful position after error', () => {
        const mockCallback = jest.fn();
        
        // First call fails, second succeeds
        mockGetCurrentPosition
          .mockImplementationOnce((success, error) => {
            error(mockError);
          })
          .mockImplementationOnce((success) => {
            success(mockPosition);
          });

        getInitialLocation(mockCallback);
        
        // Should be called once initially
        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
        expect(mockCallback).not.toHaveBeenCalled();
      });
    });

    describe('when geolocation is not supported', () => {
      it('should handle missing geolocation gracefully', () => {
        // Temporarily remove geolocation
        const originalGeolocation = global.navigator.geolocation;
        delete (global.navigator as any).geolocation;
        
        const mockCallback = jest.fn();
        
        expect(() => {
          getInitialLocation(mockCallback);
        }).not.toThrow();
        
        // Restore geolocation
        Object.defineProperty(global.navigator, 'geolocation', {
          value: originalGeolocation,
          configurable: true
        });
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        // Ensure mocks are clean
        mockGetCurrentPosition.mockClear();
      });

      it('should handle undefined callback gracefully', () => {
        expect(() => {
          getInitialLocation(undefined as any);
        }).not.toThrow();
        
        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
      });

      it('should handle null callback gracefully', () => {
        expect(() => {
          getInitialLocation(null as any);
        }).not.toThrow();
        
        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
      });

      it('should work with reset parameter false', () => {
        const mockCallback = jest.fn();
        
        getInitialLocation(mockCallback, false);

        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
        expect(mockGetCurrentPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: Infinity
          }
        );
      });

      it('should handle position with missing properties', () => {
        const mockCallback = jest.fn();
        const incompletePosition = {
          coords: {
            latitude: 60.1699,
            longitude: 24.9384,
            accuracy: 10
          },
          timestamp: Date.now()
        } as GeolocationPosition;
        
        mockGetCurrentPosition.mockImplementation((success) => {
          success(incompletePosition);
        });

        expect(() => {
          getInitialLocation(mockCallback);
        }).not.toThrow();

        expect(mockCallback).toHaveBeenCalledWith(incompletePosition);
      });
    });
  });
});
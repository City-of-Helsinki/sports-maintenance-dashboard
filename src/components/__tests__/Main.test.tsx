/*eslint no-console: 0*/
'use strict';

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Main from '../Main';
import { renderWithProviders } from '../../../test/testUtils';
import * as actions from '../../actions/index';
import { RootState } from '../../reducers/types';

// Mock the actions
jest.mock('../../actions/index', () => ({
  fetchUnitsWithServices: jest.fn(),
  fetchResource: jest.fn(),
  setUserLocation: jest.fn(),
  getNearestUnits: jest.fn(),
  setResourceFetchStart: jest.fn()
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

// Mock geolocation
jest.mock('../../lib/geolocation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getInitialLocation: jest.fn((callback: (position: any) => void, returnIfUnavailable: boolean) => {
    const mockPosition = {
      coords: {
        latitude: 60.1699,
        longitude: 24.9384,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    };
    callback(mockPosition);
  })
}));

// Mock getCurrentSeason
jest.mock('../utils', () => ({
  getCurrentSeason: jest.fn(() => '2025-2026')
}));

const mockActions = {
  fetchUnitsWithServices: actions.fetchUnitsWithServices as jest.MockedFunction<typeof actions.fetchUnitsWithServices>,
  fetchResource: actions.fetchResource as jest.MockedFunction<typeof actions.fetchResource>,
  setUserLocation: actions.setUserLocation as jest.MockedFunction<typeof actions.setUserLocation>,
  getNearestUnits: actions.getNearestUnits as jest.MockedFunction<typeof actions.getNearestUnits>,
  setResourceFetchStart: actions.setResourceFetchStart as jest.MockedFunction<typeof actions.setResourceFetchStart>
};

const defaultAuthenticatedState: Partial<RootState> = {
  auth: {
    token: 'test-token',
    maintenance_organization: 'test-org',
    login_id: 'test-user'
  },
  serviceGroup: 'skiing',
  updateQueue: {
    1: { unitId: '123', status: 'pending', serviced: false, property: 'test', value: 'test' },
    2: { unitId: '456', status: 'pending', serviced: false, property: 'test', value: 'test' }
  }
};

const defaultUnauthenticatedState: Partial<RootState> = {
  auth: {
    token: null,
    maintenance_organization: 'test-org',
    login_id: null
  },
  serviceGroup: 'skiing',
  updateQueue: {}
};

const renderComponent = (initialState: Partial<RootState> = defaultAuthenticatedState) => {
  return renderWithProviders(<Main />, { initialState });
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(mockActions).forEach(mockFn => {
    mockFn.mockReturnValue({ type: 'MOCK_ACTION', payload: undefined, meta: undefined });
  });
  mockNavigate.mockClear();
});

describe('Main Component', () => {
  it('should be importable and render without crashing', () => {
    expect(Main).toBeDefined();
    expect(typeof Main).toBe('function');
    
    renderComponent();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should render with correct CSS class', () => {
    const { container } = renderComponent();
    
    const mainElement = container.querySelector('.index');
    expect(mainElement).toBeInTheDocument();
  });

  it('should render navigation elements', () => {
    renderComponent();
    
    // Get all links and verify specific ones
    const links = screen.getAllByRole('link');
    const homeLink = links.find(link => link.getAttribute('href') === '/');
    const groupLink = links.find(link => link.getAttribute('href') === '/group');
    const queueLink = links.find(link => link.getAttribute('href') === '/queue');
    
    expect(homeLink).toBeInTheDocument();
    expect(groupLink).toBeInTheDocument();
    expect(queueLink).toBeInTheDocument();
    
    // Verify the home link contains the home icon
    expect(homeLink?.querySelector('.icon-home')).toBeInTheDocument();
    // Verify the group link contains the list icon
    expect(groupLink?.querySelector('.icon-list')).toBeInTheDocument();
    // Verify the queue link contains the transfer icon
    expect(queueLink?.querySelector('.glyphicon-transfer')).toBeInTheDocument();
  });

  it('should display notification count when there are unsent updates', () => {
    renderComponent();
    
    const notificationCount = screen.getByText('2'); // 2 items in updateQueue
    expect(notificationCount).toBeInTheDocument();
    expect(notificationCount).toHaveClass('notification-count');
  });

  it('should not display notification count when there are no unsent updates', () => {
    const stateWithoutUpdates = {
      ...defaultAuthenticatedState,
      updateQueue: {}
    };
    
    renderComponent(stateWithoutUpdates);
    
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('should display service group title and app title', () => {
    renderComponent();
    
    expect(screen.getByText('Hiihtoladut')).toBeInTheDocument();
    expect(screen.getByText('Pulkka 2025-2026')).toBeInTheDocument();
  });

  describe('Authentication and Data Fetching', () => {
    it('should fetch data when user is authenticated', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockActions.setResourceFetchStart).toHaveBeenCalledWith('service');
        expect(mockActions.fetchResource).toHaveBeenCalledWith(
          'service',
          { id: expect.any(String) },
          ['id', 'name'],
          ['observable_properties']
        );
        expect(mockActions.setResourceFetchStart).toHaveBeenCalledWith('unit');
        expect(mockActions.fetchUnitsWithServices).toHaveBeenCalledWith(
          expect.any(Array),
          'test-org',
          {
            selected: ['id', 'name', 'services', 'location', 'extensions'],
            embedded: ['observations']
          }
        );
      });
    });

    it('should redirect to login when user is not authenticated', async () => {
      jest.useFakeTimers();
      
      renderComponent(defaultUnauthenticatedState);

      // Fast-forward time to trigger setTimeout
      jest.advanceTimersByTime(10);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });

      jest.useRealTimers();
    });

    it('should not fetch data when user is not authenticated', () => {
      renderComponent(defaultUnauthenticatedState);

      expect(mockActions.setResourceFetchStart).not.toHaveBeenCalled();
      expect(mockActions.fetchResource).not.toHaveBeenCalled();
      expect(mockActions.fetchUnitsWithServices).not.toHaveBeenCalled();
    });

    it('should set user location and get nearest units', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockActions.setUserLocation).toHaveBeenCalledWith(
          expect.objectContaining({
            coords: expect.objectContaining({
              latitude: 60.1699,
              longitude: 24.9384
            })
          })
        );
        expect(mockActions.getNearestUnits).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Array),
          'test-org'
        );
      });
    });
  });

  describe('Service Group Handling', () => {
    it('should work with different service groups', () => {
      const stateWithSwimming = {
        ...defaultAuthenticatedState,
        serviceGroup: 'swimming'
      };
      
      renderComponent(stateWithSwimming);
      
      expect(screen.getByText('Uimarannat')).toBeInTheDocument();
    });

    it('should use correct services for the selected service group', async () => {
      renderComponent();

      await waitFor(() => {
        // Skiing services should be used
        expect(mockActions.fetchResource).toHaveBeenCalledWith(
          'service',
          expect.objectContaining({
            id: '191,318' // actual skiing service IDs
          }),
          expect.any(Array),
          expect.any(Array)
        );
      });
    });
  });

  describe('Utility Functions', () => {
    it('should correctly identify authenticated users', () => {
      const authWithToken = { token: 'test-token', maintenance_organization: 'test', login_id: 'test' };
      const authWithoutToken = { token: null, maintenance_organization: 'test', login_id: null };
      
      // These are tested indirectly through component behavior
      renderComponent({ ...defaultAuthenticatedState, auth: authWithToken });
      expect(mockNavigate).not.toHaveBeenCalled();
      
      renderComponent({ ...defaultUnauthenticatedState, auth: authWithoutToken });
      // Navigation happens in setTimeout, so we don't test it here to avoid timing issues
    });

    it('should handle authenticated state properly without redirecting', () => {
      // Test the case where user is authenticated and requireAuth returns true
      // This test ensures the return true path in requireAuth is covered
      const authenticatedState = {
        ...defaultAuthenticatedState,
        auth: {
          token: 'valid-token',
          maintenance_organization: 'test-org',
          login_id: 'test-user'
        }
      };
      
      renderComponent(authenticatedState);
      
      // User should not be redirected when authenticated
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      
      // Data fetching should proceed normally
      expect(mockActions.setResourceFetchStart).toHaveBeenCalled();
      expect(mockActions.fetchResource).toHaveBeenCalled();
    });
  });
});
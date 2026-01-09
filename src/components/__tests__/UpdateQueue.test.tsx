import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UpdateQueue from '../UpdateQueue';
import { renderWithProviders } from '../../../test/testUtils';
import * as actions from '../../actions/index';
import { Unit } from 'types';
import { RootState } from 'reducers/types';

// Mock the actions
jest.mock('../../actions/index', () => ({
  retryImmediately: jest.fn()
}));

// Mock global confirm
const mockConfirm = jest.fn();
Object.defineProperty(globalThis, 'confirm', { value: mockConfirm, writable: true });

// Mock localStorage
const mockLocalStorage = {
  clear: jest.fn()
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

// Suppress JSDOM navigation errors by mocking console.error during location mocking
const originalConsoleError = console.error;

// Mock location
delete (window as any).location;
console.error = jest.fn(); // Suppress JSDOM navigation error
(window as any).location = { href: '' };
console.error = originalConsoleError; // Restore console.error

const mockRetryImmediately = actions.retryImmediately as jest.MockedFunction<typeof actions.retryImmediately>;

const mockUnits: Record<number, Unit> = {
  123: {
    id: 123,
    name: { fi: 'Test Unit 1' },
    services: [1],
    address_postal_full: 'Test Address 1',
    call_charge_info: { fi: 'Test charge info' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street 1' }
  },
  456: {
    id: 456,
    name: { fi: 'Test Unit 2' },
    services: [2],
    address_postal_full: 'Test Address 2',
    call_charge_info: { fi: 'Test charge info' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street 2' }
  },
  789: {
    id: 789,
    name: { fi: 'Latest Unit' },
    services: [3],
    address_postal_full: 'Test Address 3',
    call_charge_info: { fi: 'Test charge info' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street 3' }
  }
};

const defaultState: RootState = {
  data: {
    unit: mockUnits,
    unitsByDistance: [],
    observable_property: {},
    observation: {},
    service: {},
    loading: {}
  },
  unitsByUpdateTime: ['789'],
  auth: {
    token: 'test-token',
    maintenance_organization: 'test-org',
    login_id: 'test-user-123'
  },
  authError: null,
  updateFlush: false,
  serviceGroup: 'skiing',
  updateQueue: {
    1: { unitId: '123', status: 'pending', serviced: false, property: '1', value: 'test' },
    2: { unitId: '456', status: 'pending', serviced: false, property: '1', value: 'test' }
  },
  userLocation: null,
  unitsByUpdateCount: {}
};

const renderComponent = (initialState = defaultState) => {
  return renderWithProviders(<UpdateQueue />, { initialState });
};

describe('UpdateQueue', () => {
  beforeEach(() => {
    mockRetryImmediately.mockClear();
    mockRetryImmediately.mockReturnValue({ type: 'RETRY_IMMEDIATELY', payload: undefined });
    mockConfirm.mockClear();
    mockLocalStorage.clear.mockClear();
    (window as any).location.href = 'http://localhost/';
  });

  it('renders login section with user ID', () => {
    renderComponent();

    expect(screen.getByText(/Kirjautuminen/)).toBeInTheDocument();
    expect(screen.getByText('(ID: test-user-123)')).toBeInTheDocument();
    expect(screen.getByText('Kirjaudu ulos')).toBeInTheDocument();
  });

  it('renders pending updates queue', () => {
    renderComponent();

    expect(screen.getByText('Verkkoyhteyttä odottavat päivitykset')).toBeInTheDocument();
    expect(screen.getByText('Test Unit 1')).toBeInTheDocument();
    expect(screen.getByText('Test Unit 2')).toBeInTheDocument();
    
    const unitLinks = screen.getAllByRole('link');
    const unit1Link = unitLinks.find(link => link.textContent?.includes('Test Unit 1'));
    const unit2Link = unitLinks.find(link => link.textContent?.includes('Test Unit 2'));
    
    expect(unit1Link).toHaveAttribute('href', '/unit/123');
    expect(unit2Link).toHaveAttribute('href', '/unit/456');
  });

  it('renders retry button', () => {
    renderComponent();

    const retryButton = screen.getByRole('button', { name: /yritä uudelleen/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveClass('btn', 'btn-default', 'btn-block');
  });

  it('renders latest updates section', () => {
    renderComponent();

    expect(screen.getByText('Onnistuneet päivitykset')).toBeInTheDocument();
    expect(screen.getByText('Tässä listassa on viimeisimmät onnistuneesti päivitetyt paikat')).toBeInTheDocument();
    expect(screen.getByText('Latest Unit')).toBeInTheDocument();
  });

  it('handles logout confirmation and clears storage', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);
    renderComponent();

    const logoutButton = screen.getByRole('button', { name: /kirjaudu ulos/i });
    await user.click(logoutButton);

    expect(mockConfirm).toHaveBeenCalledWith('Haluatko varmasti kirjautua ulos?');
    expect(mockLocalStorage.clear).toHaveBeenCalled();
    expect((window as any).location.href).toBe('http://localhost/');
  });

  it('handles logout cancellation', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);
    renderComponent();

    const logoutButton = screen.getByRole('button', { name: /kirjaudu ulos/i });
    await user.click(logoutButton);

    expect(mockConfirm).toHaveBeenCalledWith('Haluatko varmasti kirjautua ulos?');
    expect(mockLocalStorage.clear).not.toHaveBeenCalled();
    expect((window as any).location.href).toBe('http://localhost/');
  });

  it('dispatches retry action when retry button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const retryButton = screen.getByRole('button', { name: /yritä uudelleen/i });
    await user.click(retryButton);

    expect(mockRetryImmediately).toHaveBeenCalled();
  });

  it('renders empty queue state', () => {
    const stateWithEmptyQueue: RootState = {
      ...defaultState,
      updateQueue: {}
    };

    renderComponent(stateWithEmptyQueue);

    expect(screen.getByText('Verkkoyhteyttä odottavat päivitykset')).toBeInTheDocument();
    expect(screen.queryByText('Test Unit 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Unit 2')).not.toBeInTheDocument();
  });

  it('renders empty latest updates state', () => {
    const stateWithoutLatest = {
      ...defaultState,
      unitsByUpdateTime: []
    };

    renderComponent(stateWithoutLatest);

    expect(screen.getByText('Onnistuneet päivitykset')).toBeInTheDocument();
    expect(screen.queryByText('Latest Unit')).not.toBeInTheDocument();
  });

  it('handles missing login ID gracefully', () => {
    const stateWithoutLoginId = {
      ...defaultState,
      auth: {
        ...defaultState.auth,
        login_id: null
      }
    };

    renderComponent(stateWithoutLoginId);

    expect(screen.getByText(/Kirjautuminen/)).toBeInTheDocument();
    expect(screen.getByText('(ID: )')).toBeInTheDocument();
  });

  it('renders correct DOM structure', () => {
    renderComponent();

    // Check main structure
    expect(document.querySelector('.row')).toBeInTheDocument();
    expect(document.querySelector('.col-xs-12')).toBeInTheDocument();
    expect(document.querySelector('.list-group.facility-drilldown')).toBeInTheDocument();
    expect(document.querySelector('hr')).toBeInTheDocument();
  });

  it('renders glyphicon icons', () => {
    renderComponent();

    const refreshIcon = document.querySelector('.glyphicon-refresh');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('renders multiple queue items with correct keys', () => {
    const stateWithMultipleItems: RootState = {
      ...defaultState,
      updateQueue: {
        123: { unitId: '123', status: 'pending', serviced: false, property: '1', value: 'test' },
        124: { unitId: '123', status: 'pending', serviced: false, property: '2', value: 'test2' },
        456: { unitId: '456', status: 'pending', serviced: false, property: '1', value: 'test' }
      }
    };

    renderComponent(stateWithMultipleItems);

    const unit1Links = screen.getAllByText('Test Unit 1');
    const unit2Links = screen.getAllByText('Test Unit 2');
    
    expect(unit1Links).toHaveLength(2); // Should appear twice
    expect(unit2Links).toHaveLength(1);
  });
});
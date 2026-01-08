import React from 'react';
import { screen } from '@testing-library/react';

import UnitHistory from '../../src/components/UnitHistory';
import { renderWithRoute } from '../testUtils';
import * as actions from '../../src/actions/index';

// Mock the actions
jest.mock('../../src/actions/index', () => ({
  fetchUnitObservations: jest.fn()
}));

const mockFetchUnitObservations = actions.fetchUnitObservations as jest.MockedFunction<typeof actions.fetchUnitObservations>;

const mockUnit = {
  id: 123,
  name: { fi: 'Test Unit' },
  services: [1, 2]
};

const mockObservations = [
  {
    id: 1,
    unit: 123,
    property: 'test_property_1',
    time: '2024-01-01T12:00:00Z',
    expiration_time: null,
    name: { fi: 'Test Property 1' },
    quality: 'good',
    value: 'test_value_1',
    primary: true
  },
  {
    id: 2,
    unit: 123,
    property: 'test_property_2',
    time: '2024-01-02T12:00:00Z',
    expiration_time: null,
    name: { fi: 'Test Property 2' },
    quality: 'good',
    value: 'test_value_2',
    primary: false
  }
];

const defaultState = {
  data: {
    unit: { 123: mockUnit },
    observation: {
      1: mockObservations[0],
      2: mockObservations[1]
    },
    unitsByDistance: [],
    observable_property: {},
    service: {},
    loading: {}
  },
  auth: {
    token: null,
    maintenance_organization: 'test-org',
    login_id: null
  },
  authError: null,
  updateQueue: {},
  updateFlush: false,
  serviceGroup: 'skiing',
  userLocation: null,
  unitsByUpdateTime: [],
  unitsByUpdateCount: {},
  selectedUnits: [],
  observationsByPropertyByUnit: {},
  allowedValuesByProperty: {},
  massEdit: {
    selectedUnits: [],
    isEditing: false,
    property: null,
    value: null
  }
};

const renderComponent = (unitId = '123', initialState = defaultState) => {
  return renderWithRoute(<UnitHistory />, {
    route: `/unit/${unitId}/history`,
    path: '/unit/:unitId/history',
    initialState
  });
};

describe('UnitHistory', () => {
  beforeEach(() => {
    mockFetchUnitObservations.mockClear();
    mockFetchUnitObservations.mockReturnValue({ type: 'FETCH_UNIT_OBSERVATIONS' });
  });

  it('renders loading state when isLoading is true', () => {
    const stateWithLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {
          'unit-123': true
        }
      }
    };

    renderComponent('123', stateWithLoading);
    expect(screen.getByText('Ladataan...')).toBeInTheDocument();
  });

  it('renders loading state when observation loading is true', () => {
    const stateWithObservationLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {
          'observation-123': true
        }
      }
    };

    renderComponent('123', stateWithObservationLoading);
    expect(screen.getByText('Ladataan...')).toBeInTheDocument();
  });

  it('renders "unit not found" when unit is undefined and not loading', () => {
    const stateWithoutUnit = {
      ...defaultState,
      data: {
        ...defaultState.data,
        unit: {},
        loading: {}
      }
    };

    renderComponent('123', stateWithoutUnit);
    expect(screen.getByText('Yksikköä ei löytynyt')).toBeInTheDocument();
  });

  it('prioritizes loading state over unit not found', () => {
    const stateWithLoadingAndNoUnit = {
      ...defaultState,
      data: {
        ...defaultState.data,
        unit: {},
        loading: {
          'unit-123': true
        }
      }
    };

    renderComponent('123', stateWithLoadingAndNoUnit);
    expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    expect(screen.queryByText('Yksikköä ei löytynyt')).not.toBeInTheDocument();
  });

  it('renders unit name and back link when unit is loaded and not loading', () => {
    const stateWithNoLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {}
      }
    };

    renderComponent('123', stateWithNoLoading);

    expect(screen.getByText('Test Unit')).toBeInTheDocument();
    expect(screen.getByText('Takaisin')).toBeInTheDocument();
    
    const backLink = screen.getByRole('link', { name: /takaisin/i });
    expect(backLink).toHaveAttribute('href', '/unit/123');
  });

  it('dispatches fetchUnitObservations on component mount', () => {
    const stateWithNoLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {}
      }
    };

    renderComponent('123', stateWithNoLoading);

    expect(mockFetchUnitObservations).toHaveBeenCalledWith('123');
    expect(mockFetchUnitObservations).toHaveBeenCalledTimes(1);
  });

  it('renders observations when they exist and not loading', () => {
    const stateWithNoLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {}
      }
    };

    renderComponent('123', stateWithNoLoading);

    expect(screen.getByText('Historia')).toBeInTheDocument();
    // Check that observation components are rendered (they contain the property names)
    expect(screen.getByText('Test Property 1')).toBeInTheDocument();
    expect(screen.getByText('Test Property 2')).toBeInTheDocument();
  });

  it('renders "no history" message when observations are empty and not loading', () => {
    const stateWithoutObservations = {
      ...defaultState,
      data: {
        ...defaultState.data,
        observation: {},
        loading: {}
      }
    };

    renderComponent('123', stateWithoutObservations);

    expect(screen.getByText('Historia')).toBeInTheDocument();
    expect(screen.getByText('Ei historiatietoja')).toBeInTheDocument();
    expect(screen.queryByText('Test Property')).not.toBeInTheDocument();
  });

  it('filters observations by unit id when not loading', () => {
    const stateWithMultipleObservations = {
      ...defaultState,
      data: {
        ...defaultState.data,
        observation: {
          1: { ...mockObservations[0], unit: 123 },
          2: { ...mockObservations[1], unit: 123 },
          3: { 
            id: 3, 
            unit: 456, 
            property: 'other_property',
            time: '2024-01-03T12:00:00Z',
            expiration_time: null,
            name: { fi: 'Other Property' },
            quality: 'good',
            value: 'other_value',
            primary: false
          }
        },
        loading: {}
      }
    };

    renderComponent('123', stateWithMultipleObservations);

    expect(screen.getByText('Test Property 1')).toBeInTheDocument();
    expect(screen.getByText('Test Property 2')).toBeInTheDocument();
    expect(screen.queryByText('Other Property')).not.toBeInTheDocument();
  });

  it('handles different unit ids correctly when not loading', () => {
    const stateWithDifferentUnit = {
      ...defaultState,
      data: {
        ...defaultState.data,
        unit: { 456: { ...mockUnit, id: 456, name: { fi: 'Different Unit' } } },
        observation: {
          3: { ...mockObservations[0], id: 3, unit: 456 }
        },
        loading: {}
      }
    };

    renderComponent('456', stateWithDifferentUnit);

    expect(screen.getByText('Different Unit')).toBeInTheDocument();
    expect(mockFetchUnitObservations).toHaveBeenCalledWith('456');
    
    const backLink = screen.getByRole('link', { name: /takaisin/i });
    expect(backLink).toHaveAttribute('href', '/unit/456');
  });

  it('handles missing observations gracefully when not loading', () => {
    const stateWithNullObservations = {
      ...defaultState,
      data: {
        ...defaultState.data,
        observation: null as any,
        loading: {}
      }
    };

    renderComponent('123', stateWithNullObservations);

    expect(screen.getByText('Test Unit')).toBeInTheDocument();
    expect(screen.getByText('Ei historiatietoja')).toBeInTheDocument();
  });

  it('renders correct DOM structure when not loading', () => {
    const stateWithNoLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {}
      }
    };

    renderComponent('123', stateWithNoLoading);

    // Check main container structure
    expect(document.querySelector('.row')).toBeInTheDocument();
    expect(document.querySelector('.col-xs-12')).toBeInTheDocument();
    expect(document.querySelector('.list-group.facility-return')).toBeInTheDocument();
    expect(document.querySelector('.well')).toBeInTheDocument();
    expect(document.querySelector('.unit-observations')).toBeInTheDocument();
  });

  it('renders glyphicon for back link when not loading', () => {
    const stateWithNoLoading = {
      ...defaultState,
      data: {
        ...defaultState.data,
        loading: {}
      }
    };

    renderComponent('123', stateWithNoLoading);

    const glyphicon = document.querySelector('.glyphicon-chevron-left');
    expect(glyphicon).toBeInTheDocument();
  });
});
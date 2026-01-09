import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UpdateConfirmation, { canPropertyBeMaintained } from '../UpdateConfirmation';
import { renderWithRoute } from '../../../test/testUtils';
import * as actions from '../../actions/index';

// Mock the actions
jest.mock('../../actions/index', () => ({
  enqueueObservation: jest.fn()
}));

// Mock unitObservableProperties
jest.mock('../../lib/municipalServicesClient', () => ({
  unitObservableProperties: jest.fn()
}));

import { unitObservableProperties } from '../../lib/municipalServicesClient';
import { RootState } from '../../reducers/types';

const mockEnqueueObservation = actions.enqueueObservation as jest.MockedFunction<typeof actions.enqueueObservation>;
const mockUnitObservableProperties = unitObservableProperties as jest.MockedFunction<typeof unitObservableProperties>;

const mockUnit = {
  id: 123,
  name: { fi: 'Test Unit' },
  services: [1, 2],
  address_postal_full: 'Test Address',
  call_charge_info: { fi: 'Call info' },
  displayed_service_owner: { fi: 'Test Owner' },
  street_address: { fi: 'Test Street' }
};

const mockAllowedValue = {
  identifier: 'good_condition',
  quality: 'good',
  name: { fi: 'Hyvä kunto' },
  description: { fi: 'Hyvässä kunnossa' },
  property: 'test_property'
};

const mockObservableProperty = {
  id: 'test_property',
  name: { fi: 'Test Property' },
  measurement_unit: null,
  observation_type: 'categorical',
  allowed_values: [
    mockAllowedValue,
    {
      identifier: 'poor_condition',
      quality: 'poor',
      name: { fi: 'Huono kunto' },
      description: { fi: 'Huonossa kunnossa' },
      property: 'test_property'
    }
  ]
};

const mockEventAllowedValue = {
  identifier: 'event',
  quality: 'poor',
  name: { fi: 'Tapahtuma' },
  description: { fi: 'Tapahtuma merkitty' },
  property: 'test_property'
};

const mockSatisfactoryAllowedValue = {
  identifier: 'satisfactory_condition',
  quality: 'satisfactory',
  name: { fi: 'Tyydyttävä kunto' },
  description: { fi: 'Tyydyttävässä kunnossa' },
  property: 'test_property'
};

const defaultState: RootState = {
  data: {
    unit: { 123: mockUnit },
    unitsByDistance: [],
    observable_property: {},
    observation: {},
    service: {
      1: {
        id: 1,
        name: { fi: 'Test Service' },
        observable_properties: [mockObservableProperty]
      }
    },
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
  unitsByUpdateCount: {}
};

const renderComponent = (unitId = '123', propertyId = 'test_property', valueId = 'good_condition', initialState = defaultState) => {
  return renderWithRoute(<UpdateConfirmation />, {
    route: `/unit/${unitId}/update/${propertyId}/${valueId}`,
    path: '/unit/:unitId/update/:propertyId/:valueId',
    initialState
  });
};

describe('UpdateConfirmation', () => {
  beforeEach(() => {
    mockEnqueueObservation.mockClear();
    mockEnqueueObservation.mockReturnValue({
      type: 'ENQUEUE_OBSERVATION',
      payload: undefined
    });
    mockUnitObservableProperties.mockClear();
    mockUnitObservableProperties.mockReturnValue([mockObservableProperty]);
  });

  describe('loading states', () => {
    it('renders loading state when unit is undefined', () => {
      const stateWithoutUnit = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {}
        }
      };

      renderComponent('123', 'test_property', 'good_condition', stateWithoutUnit);
      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('renders loading state when allowed value is not found', () => {
      renderComponent('123', 'test_property', 'non_existent_value');
      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('renders loading state when property is not found', () => {
      renderComponent('123', 'non_existent_property', 'good_condition');
      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });
  });

  describe('successful rendering', () => {
    it('renders confirmation panel with unit status', () => {
      renderComponent();

      expect(screen.getByText('Oletko varma että haluat päivittää paikan kuntotiedon?')).toBeInTheDocument();
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
    });

    it('renders cancel button with correct link', () => {
      renderComponent();

      const cancelButton = screen.getByRole('link', { name: /peruuta/i });
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveAttribute('href', '/unit/123');
    });
  });

  describe('button rendering based on quality and property', () => {
    it('renders both observed and serviced buttons for good quality maintainable property', () => {
      renderComponent();

      expect(screen.getByText('Todettu')).toBeInTheDocument();
      expect(screen.getByText('Kunnostettu')).toBeInTheDocument();
      expect(screen.getAllByText('Hyvä kunto')).toHaveLength(2); // Both buttons show the value name
    });

    it('renders both buttons for satisfactory quality', () => {
      mockUnitObservableProperties.mockReturnValue([{
        ...mockObservableProperty,
        allowed_values: [mockSatisfactoryAllowedValue]
      }]);

      renderComponent('123', 'test_property', 'satisfactory_condition');

      expect(screen.getByText('Todettu')).toBeInTheDocument();
      expect(screen.getByText('Kunnostettu')).toBeInTheDocument();
    });

    it('renders both buttons for event identifier', () => {
      mockUnitObservableProperties.mockReturnValue([{
        ...mockObservableProperty,
        allowed_values: [mockEventAllowedValue]
      }]);

      renderComponent('123', 'test_property', 'event');

      expect(screen.getByText('Todettu')).toBeInTheDocument();
      expect(screen.getByText('Kunnostettu')).toBeInTheDocument();
    });

    it('renders only observed button for poor quality', () => {
      mockUnitObservableProperties.mockReturnValue([{
        ...mockObservableProperty,
        allowed_values: [{
          identifier: 'poor_condition',
          quality: 'poor',
          name: { fi: 'Huono kunto' },
          description: { fi: 'Huonossa kunnossa' },
          property: 'test_property'
        }]
      }]);

      renderComponent('123', 'test_property', 'poor_condition');

      expect(screen.getByText('Todettu')).toBeInTheDocument();
      expect(screen.queryByText('Kunnostettu')).not.toBeInTheDocument();
    });

    it('renders only observed button for non-maintainable property', () => {
      mockUnitObservableProperties.mockReturnValue([{
        ...mockObservableProperty,
        id: 'swimming_water_cyanobacteria',
        allowed_values: [{
          ...mockAllowedValue,
          property: 'swimming_water_cyanobacteria'
        }]
      }]);

      renderComponent('123', 'swimming_water_cyanobacteria', 'good_condition');

      expect(screen.getByText('Todettu')).toBeInTheDocument();
      expect(screen.queryByText('Kunnostettu')).not.toBeInTheDocument();
    });
  });

  describe('help text rendering', () => {
    it('renders help texts when both buttons are shown', () => {
      renderComponent();

      expect(screen.getByText(/Valitse "Todettu" jos liikuntapaikkaa ei ole juuri nyt kunnostettu/)).toBeInTheDocument();
      expect(screen.getByText(/Valitse "Kunnostettu" jos liikuntapaikka on juuri kunnostettu/)).toBeInTheDocument();
      
      // Check that help texts contain the expected value name
      const helpTexts = screen.getAllByText(/Hyvä kunto/);
      expect(helpTexts.length).toBeGreaterThanOrEqual(2); // Should appear in both help texts (and buttons)
    });

    it('does not render help texts when only one button is shown', () => {
      mockUnitObservableProperties.mockReturnValue([{
        ...mockObservableProperty,
        allowed_values: [{
          identifier: 'poor_condition',
          quality: 'poor',
          name: { fi: 'Huono kunto' },
          description: { fi: 'Huonossa kunnossa' },
          property: 'test_property'
        }]
      }]);

      renderComponent('123', 'test_property', 'poor_condition');

      expect(screen.queryByText(/Valitse "Todettu" jos liikuntapaikkaa/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Valitse "Kunnostettu" jos liikuntapaikka/)).not.toBeInTheDocument();
    });
  });

  describe('button clicks and action dispatching', () => {
    it('dispatches enqueueObservation when observed button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const observedButton = screen.getByRole('link', { name: /todettu.*hyvä kunto/i });
      await user.click(observedButton);

      expect(mockEnqueueObservation).toHaveBeenCalledWith('test_property', mockAllowedValue, 123, false);
    });

    it('dispatches enqueueObservation when serviced button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const servicedButton = screen.getByRole('link', { name: /kunnostettu.*hyvä kunto/i });
      await user.click(servicedButton);

      expect(mockEnqueueObservation).toHaveBeenCalledWith('test_property', mockAllowedValue, 123, true);
    });

    it('navigates to unit page when button is clicked', () => {
      renderComponent();

      const observedButton = screen.getByRole('link', { name: /todettu.*hyvä kunto/i });
      expect(observedButton).toHaveAttribute('href', '/unit/123');
    });
  });

  describe('different unit IDs', () => {
    it('handles different unit ID correctly', () => {
      const differentUnit = {
        ...mockUnit,
        id: 456,
        name: { fi: 'Different Unit' }
      };

      const stateWithDifferentUnit = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: { 456: differentUnit }
        }
      };

      renderComponent('456', 'test_property', 'good_condition', stateWithDifferentUnit);

      expect(screen.getByText('Different Unit')).toBeInTheDocument();
      
      const cancelButton = screen.getByRole('link', { name: /peruuta/i });
      expect(cancelButton).toHaveAttribute('href', '/unit/456');
    });
  });
});

describe('canPropertyBeMaintained', () => {
  it('returns false for swimming_water_cyanobacteria', () => {
    expect(canPropertyBeMaintained('swimming_water_cyanobacteria')).toBe(false);
  });

  it('returns true for other properties', () => {
    expect(canPropertyBeMaintained('test_property')).toBe(true);
    expect(canPropertyBeMaintained('another_property')).toBe(true);
    expect(canPropertyBeMaintained('')).toBe(true);
  });
});
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';

import UnitMassEditPropertySelect from '../UnitMassEditPropertySelect';
import { Unit, ObservableProperty } from '../../types';
import { RootState } from '../../reducers/types';
import * as municipalServicesClient from '../../lib/municipalServicesClient';

// Mock react-router-dom
const mockUseParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  Link: ({ to, className, children }: any) => (
    <a href={to} className={className} data-testid="link">{children}</a>
  )
}));

// Mock municipalServicesClient
jest.mock('../../lib/municipalServicesClient', () => ({
  unitObservableProperties: jest.fn()
}));

const mockUnitObservableProperties = municipalServicesClient.unitObservableProperties as jest.MockedFunction<
  typeof municipalServicesClient.unitObservableProperties
>;

describe('UnitMassEditPropertySelect Component', () => {
  const mockUnit1: Unit = {
    id: 123,
    name: { fi: 'Test Unit 1' },
    extensions: {
      maintenance_group: 'test-group',
      maintenance_organization: 'test-org'
    },
    services: [1, 2],
    address_postal_full: 'Test Address 1',
    call_charge_info: { fi: 'Test charge info' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street' }
  };

  const mockUnit2: Unit = {
    id: 456,
    name: { fi: 'Test Unit 2' },
    extensions: {
      maintenance_group: 'test-group',
      maintenance_organization: 'test-org'
    },
    services: [1, 3],
    address_postal_full: 'Test Address 2',
    call_charge_info: { fi: 'Test charge info' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street' }
  };

  const mockUnitDifferentGroup: Unit = {
    id: 789,
    name: { fi: 'Different Group Unit' },
    extensions: {
      maintenance_group: 'different-group',
      maintenance_organization: 'test-org'
    },
    services: [1, 2],
    address_postal_full: 'Different Address',
    call_charge_info: { fi: 'Test charge info' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street' }
  };

  const mockObservableProperty1: ObservableProperty = {
    id: 'prop-1',
    name: { fi: 'Test Property 1' },
    measurement_unit: 'meters',
    observation_type: 'quality',
    allowed_values: []
  };

  const mockObservableProperty2: ObservableProperty = {
    id: 'prop-2',
    name: { fi: 'Test Property 2' },
    measurement_unit: 'celsius',
    observation_type: 'temperature',
    allowed_values: []
  };

  const defaultState: Partial<RootState> = {
    data: {
      unit: {
        '123': mockUnit1,
        '456': mockUnit2,
        '789': mockUnitDifferentGroup
      },
      unitsByDistance: [],
      observable_property: {},
      observation: {},
      service: {
        '1': { id: 1, name: { fi: 'Service 1' }, observable_properties: [] },
        '2': { id: 2, name: { fi: 'Service 2' }, observable_properties: [] },
        '3': { id: 3, name: { fi: 'Service 3' }, observable_properties: [] }
      },
      loading: { unit: false }
    },
    serviceGroup: 'skiing'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ groupId: 'test-group' });
  });

  describe('Parameter Validation', () => {
    it('should render error when groupId is missing', () => {
      mockUseParams.mockReturnValue({ groupId: undefined });

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(screen.getByText('Virheellinen ryhmätunnus')).toBeInTheDocument();
    });

    it('should render error when groupId is empty', () => {
      mockUseParams.mockReturnValue({ groupId: '' });

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(screen.getByText('Virheellinen ryhmätunnus')).toBeInTheDocument();
    });
  });

  describe('Unit Filtering', () => {
    it('should filter units by maintenance group', () => {
      mockUnitObservableProperties.mockReturnValue([mockObservableProperty1]);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      // Should call unitObservableProperties for units in the test-group only
      expect(mockUnitObservableProperties).toHaveBeenCalledTimes(2);
      expect(mockUnitObservableProperties).toHaveBeenCalledWith(
        mockUnit1,
        defaultState.data!.service,
        true // onlyQualityProperties for skiing
      );
      expect(mockUnitObservableProperties).toHaveBeenCalledWith(
        mockUnit2,
        defaultState.data!.service,
        true
      );
      // Should NOT be called for the unit in different-group
      expect(mockUnitObservableProperties).not.toHaveBeenCalledWith(
        mockUnitDifferentGroup,
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Observable Properties Handling', () => {
    it('should show loading message when unit data is loading', () => {
      const loadingState = {
        ...defaultState,
        data: {
          ...defaultState.data!,
          loading: { unit: true, service: false }
        }
      };

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: loadingState });

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('should show loading message when service data is loading', () => {
      const loadingState = {
        ...defaultState,
        data: {
          ...defaultState.data!,
          loading: { unit: false, service: true }
        }
      };

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: loadingState });

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('should handle undefined properties gracefully', () => {
      mockUnitObservableProperties.mockReturnValue(undefined as any);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(screen.getByText('Ei muokattavia paikkoja')).toBeInTheDocument();
    });

    it('should show no editable places message when no properties available', () => {
      mockUnitObservableProperties.mockReturnValue([]);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(screen.getByText('Ei muokattavia paikkoja')).toBeInTheDocument();
    });

    it('should remove duplicate properties', () => {
      // Mock first unit returning two properties, second unit returning one duplicate
      mockUnitObservableProperties
        .mockReturnValueOnce([mockObservableProperty1, mockObservableProperty2])
        .mockReturnValueOnce([mockObservableProperty1]); // Duplicate

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      // Should only show unique properties
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      expect(screen.getByText('Test Property 2')).toBeInTheDocument();
      
      const property1Links = screen.getAllByText('Test Property 1');
      expect(property1Links).toHaveLength(1); // Should not be duplicated
    });
  });

  describe('Service Group Handling', () => {
    it('should pass onlyQualityProperties=true for skiing service group', () => {
      const skiiingState = { ...defaultState, serviceGroup: 'skiing' };
      mockUnitObservableProperties.mockReturnValue([mockObservableProperty1]);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: skiiingState });

      expect(mockUnitObservableProperties).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        true
      );
    });

    it('should pass onlyQualityProperties=false for swimming service group', () => {
      const swimmingState = { ...defaultState, serviceGroup: 'swimming' };
      mockUnitObservableProperties.mockReturnValue([mockObservableProperty1]);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: swimmingState });

      expect(mockUnitObservableProperties).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        false
      );
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      mockUnitObservableProperties.mockReturnValue([mockObservableProperty1, mockObservableProperty2]);
    });

    it('should render component with correct CSS classes', () => {
      const { container } = renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(container.querySelector('.facility-status')).toBeInTheDocument();
      expect(container.querySelector('.list-group.facility-return.clearfix')).toBeInTheDocument();
      expect(container.querySelector('.well')).toBeInTheDocument();
    });

    it('should render back navigation link', () => {
      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      const allLinks = screen.getAllByTestId('link');
      const backLink = allLinks.find(link => link.getAttribute('href') === '/group/test-group');
      expect(backLink).toBeDefined();
      expect(backLink).toHaveAttribute('href', '/group/test-group');
      expect(screen.getByText('Takaisin')).toBeInTheDocument();
      
      const chevronIcon = backLink?.querySelector('.glyphicon-chevron-left');
      expect(chevronIcon).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(screen.getByText('Massapäivitys')).toBeInTheDocument();
      expect(screen.getByText('Valitse päivitettävä tieto')).toBeInTheDocument();
    });

    it('should render property links correctly', () => {
      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      const propertyLinks = screen.getAllByTestId('link').filter(link =>
        link.getAttribute('href')?.includes('/mass-edit/')
      );

      expect(propertyLinks).toHaveLength(2);
      
      expect(propertyLinks[0]).toHaveAttribute('href', '/group/test-group/mass-edit/prop-1');
      expect(propertyLinks[0]).toHaveTextContent('Test Property 1');
      
      expect(propertyLinks[1]).toHaveAttribute('href', '/group/test-group/mass-edit/prop-2');
      expect(propertyLinks[1]).toHaveTextContent('Test Property 2');
    });

    it('should apply correct CSS classes to property links', () => {
      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      const propertyLinks = screen.getAllByTestId('link').filter(link =>
        link.getAttribute('href')?.includes('/mass-edit/')
      );

      propertyLinks.forEach(link => {
        expect(link).toHaveClass('list-group-item');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle units without extensions', () => {
      const unitWithoutExtensions: Unit = {
        ...mockUnit1,
        extensions: undefined
      };

      const stateWithUnitWithoutExtensions = {
        ...defaultState,
        data: {
          ...defaultState.data!,
          unit: {
            '123': unitWithoutExtensions
          }
        }
      };

      mockUnitObservableProperties.mockReturnValue([]);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: stateWithUnitWithoutExtensions });

      expect(screen.getByText('Ei muokattavia paikkoja')).toBeInTheDocument();
      expect(mockUnitObservableProperties).not.toHaveBeenCalled();
    });

    it('should handle empty unit data', () => {
      const emptyState = {
        ...defaultState,
        data: {
          ...defaultState.data!,
          unit: {}
        }
      };

      mockUnitObservableProperties.mockReturnValue([]);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: emptyState });

      expect(screen.getByText('Ei muokattavia paikkoja')).toBeInTheDocument();
      expect(mockUnitObservableProperties).not.toHaveBeenCalled();
    });

    it('should handle null/undefined properties from unitObservableProperties', () => {
      mockUnitObservableProperties.mockReturnValue(null as any);

      renderWithProviders(<UnitMassEditPropertySelect />, { initialState: defaultState });

      expect(screen.getByText('Ei muokattavia paikkoja')).toBeInTheDocument();
    });
  });
});
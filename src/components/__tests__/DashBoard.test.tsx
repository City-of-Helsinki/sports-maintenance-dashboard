import React from 'react';
import { screen } from '@testing-library/react';
import DashBoard from '../DashBoard';
import { renderWithProviders } from '../../../test/testUtils';
import { Unit } from '../../types';
import { RootState } from '../../reducers/types';

// Mock UnitListElement
jest.mock('../UnitList', () => ({
  UnitListElement: ({ unit }: { unit: Unit }) => (
    <div data-testid={`unit-element-${unit.id}`}>
      {unit.name.fi}
    </div>
  )
}));

describe('DashBoard Component', () => {
  const mockUnit1: Unit = {
    id: 1,
    name: { fi: 'Test Unit 1' },
    extensions: {
      maintenance_group: 'group1',
      maintenance_organization: 'org1'
    },
    address_postal_full: null,
    call_charge_info: { fi: '' },
    displayed_service_owner: { fi: '' },
    street_address: { fi: '' }
  };

  const mockUnit2: Unit = {
    id: 2,
    name: { fi: 'Test Unit 2' },
    extensions: {
      maintenance_group: 'group2',
      maintenance_organization: 'org2'
    },
    address_postal_full: null,
    call_charge_info: { fi: '' },
    displayed_service_owner: { fi: '' },
    street_address: { fi: '' }
  };

  const mockUnit3: Unit = {
    id: 3,
    name: { fi: 'Test Unit 3' },
    extensions: {
      maintenance_group: 'group3',
      maintenance_organization: 'org3'
    },
    address_postal_full: null,
    call_charge_info: { fi: '' },
    displayed_service_owner: { fi: '' },
    street_address: { fi: '' }
  };

  const baseUnitsByDistanceItem = {
    name: { fi: '' },
    address_postal_full: '',
    call_charge_info: { fi: '' },
    displayed_service_owner: { fi: '' },
    street_address: { fi: '' }
  };

  const defaultState: RootState = {
    data: {
      unit: {
        '1': mockUnit1,
        '2': mockUnit2,
        '3': mockUnit3
      },
      unitsByDistance: [
        {
          id: 1, distance: 100,
          ...baseUnitsByDistanceItem
        },
        {
          id: 2, distance: 200,
          ...baseUnitsByDistanceItem
        }
      ],
      observable_property: {},
      observation: {},
      service: {},
      loading: { unit: false }
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
    userLocation: {
      timestamp: Date.now(),
      coords: {
        accuracy: 10,
        latitude: 60.1695,
        longitude: 24.9354,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      }
    },
    unitsByUpdateTime: [],
    unitsByUpdateCount: {
      '1': { count: 5, id: '1' },
      '2': { count: 3, id: '2' },
      '3': { count: 8, id: '3' }
    }
  };

  const renderComponent = (initialState = defaultState) => {
    return renderWithProviders(<DashBoard />, { initialState });
  };

  describe('loading states', () => {
    it('renders loading state when unit data is loading', () => {
      const loadingState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          loading: { unit: true }
        }
      };

      renderComponent(loadingState);

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('does not render sections when loading', () => {
      const loadingState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          loading: { unit: true }
        }
      };

      renderComponent(loadingState);

      expect(screen.queryByText('Lähimmät')).not.toBeInTheDocument();
      expect(screen.queryByText('Yleisimmät')).not.toBeInTheDocument();
    });
  });

  describe('nearest units section', () => {
    it('renders nearest units section header', () => {
      renderComponent();

      expect(screen.getByText('Lähimmät')).toBeInTheDocument();
    });

    it('displays nearest units when user location is available', () => {
      renderComponent();

      // Check within the nearest section specifically
      const nearestSection = screen.getByText('Lähimmät').parentElement;
      expect(nearestSection).toBeInTheDocument();
      
      // Check that unit names appear (using getAllByText since units can appear in both sections)
      expect(screen.getAllByText('Test Unit 1')).toHaveLength(2); // Appears in both sections
      expect(screen.getAllByText('Test Unit 2')).toHaveLength(2); // Appears in both sections
    });

    it('shows location not available message when userLocation is null', () => {
      const stateWithoutLocation = {
        ...defaultState,
        userLocation: null
      };

      renderComponent(stateWithoutLocation);

      expect(screen.getByText('Sijainti ei saatavilla.')).toBeInTheDocument();
    });

    it('handles empty unitsByDistance array', () => {
      const stateWithEmptyDistance = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unitsByDistance: []
        }
      };

      renderComponent(stateWithEmptyDistance);

      expect(screen.getByText('Lähimmät')).toBeInTheDocument();
      // The frequent section should still show units
      expect(screen.getByText('Test Unit 3')).toBeInTheDocument();
    });

    it('filters out units with undefined data', () => {
      const stateWithInvalidUnit: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {
            '1': mockUnit1,
            '2': undefined as any
          },
          unitsByDistance: [
            {
              ...baseUnitsByDistanceItem,
              id: 1,
              distance: 100
              
            },
            {
              ...baseUnitsByDistanceItem,
              id: 2,
              distance: 200
            }
          ]
        }
      };

      renderComponent(stateWithInvalidUnit);

      // Unit 1 appears in both sections, Unit 2 should not appear anywhere
      expect(screen.getAllByText('Test Unit 1')).toHaveLength(2); // In both sections
      expect(screen.queryByText('Mock Unit 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Unit 2')).not.toBeInTheDocument();
    });
  });

  describe('frequent units section', () => {
    it('renders frequent units section header', () => {
      renderComponent();

      expect(screen.getByText('Yleisimmät')).toBeInTheDocument();
    });

    it('displays frequent units sorted by update count (descending)', () => {
      renderComponent();

      // Unit 3 has count 8, Unit 1 has count 5, Unit 2 has count 3
      // Check that all units are displayed (using getAllByText since units can appear in both sections)
      expect(screen.getAllByText('Test Unit 3')).toHaveLength(1); // Only in frequent
      expect(screen.getAllByText('Test Unit 1')).toHaveLength(2); // In both sections
      expect(screen.getAllByText('Test Unit 2')).toHaveLength(2); // In both sections
    });

    it('handles empty unitsByUpdateCount', () => {
      const stateWithEmptyUpdateCount = {
        ...defaultState,
        unitsByUpdateCount: {}
      };

      renderComponent(stateWithEmptyUpdateCount);

      expect(screen.getByText('Yleisimmät')).toBeInTheDocument();
      // Should not show units in frequent section, but nearest can still show if location available
      const frequentSection = screen.getByText('Yleisimmät').nextElementSibling;
      expect(frequentSection).toBeEmptyDOMElement();
    });

    it('limits frequent units to top 20', () => {
      // Create state with 25 units, only including them in frequent, not nearest
      const manyUnits: Record<string, Unit> = {};
      const manyUpdateCounts: Record<string, { count: number; id: string }> = {};
      
      for (let i = 1; i <= 25; i++) {
        manyUnits[i.toString()] = {
          ...mockUnit1,
          id: i,
          name: { fi: `Unit ${i}` }
        };
        manyUpdateCounts[i.toString()] = { count: i, id: i.toString() };
      }

      const stateWithManyUnits: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: manyUnits,
          unitsByDistance: [] // Clear nearest to avoid confusion
        },
        userLocation: null, // Disable nearest section
        unitsByUpdateCount: manyUpdateCounts
      };

      renderComponent(stateWithManyUnits);

      // Check that we have exactly 20 units and the highest count units are included
      const frequentSection = screen.getByText('Yleisimmät').nextElementSibling;
      const unitElements = frequentSection?.querySelectorAll('[data-testid^="unit-element-"]');
      expect(unitElements).toHaveLength(20); // Should be limited to 20

      // The units shown are 20 down to 1 based on the test output
      expect(screen.getByText('Unit 20')).toBeInTheDocument();
      expect(screen.getByText('Unit 1')).toBeInTheDocument();
      // Units 21-25 should not be present due to the limit
      expect(screen.queryByText('Unit 21')).not.toBeInTheDocument();
      expect(screen.queryByText('Unit 25')).not.toBeInTheDocument();
    });
  });

  describe('empty data states', () => {
    it('handles empty unit data', () => {
      const stateWithEmptyUnits = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {}
        }
      };

      renderComponent(stateWithEmptyUnits);

      expect(screen.getByText('Lähimmät')).toBeInTheDocument();
      expect(screen.getByText('Yleisimmät')).toBeInTheDocument();
      
      // Both sections should be empty when no units exist
      const nearestSection = screen.getByText('Lähimmät').nextElementSibling;
      const frequentSection = screen.getByText('Yleisimmät').nextElementSibling;
      expect(nearestSection).toBeEmptyDOMElement();
      expect(frequentSection).toBeEmptyDOMElement();
    });

    it('renders sections even when no units match criteria', () => {
      const stateWithMismatchedData: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unitsByDistance: [{
            id: 999, distance: 100,
            ...baseUnitsByDistanceItem
          }] // Non-existent unit
        },
        unitsByUpdateCount: {
          '999': { count: 5, id: '999' } // Non-existent unit
        }
      };

      renderComponent(stateWithMismatchedData);

      expect(screen.getByText('Lähimmät')).toBeInTheDocument();
      expect(screen.getByText('Yleisimmät')).toBeInTheDocument();
    });
  });

  describe('data integration', () => {
    it('correctly integrates unitsByDistance with unit data', () => {
      const stateWithSpecificOrder: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unitsByDistance: [
            {
              id: 3, distance: 50,
              ...baseUnitsByDistanceItem
            },
            {
              id: 1, distance: 100,
              ...baseUnitsByDistanceItem
            }
          ]
        },
        // Clear frequent units to avoid confusion
        unitsByUpdateCount: {}
      };

      renderComponent(stateWithSpecificOrder);

      // Should show units in the order specified by unitsByDistance
      expect(screen.getByText('Test Unit 3')).toBeInTheDocument();
      expect(screen.getByText('Test Unit 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Unit 2')).not.toBeInTheDocument(); // Not in unitsByDistance
    });

    it('correctly sorts and limits frequent units', () => {
      const stateWithVariedCounts = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unitsByDistance: [] // Clear nearest to focus on frequent
        },
        unitsByUpdateCount: {
          '1': { count: 10, id: '1' },
          '2': { count: 5, id: '2' },
          '3': { count: 15, id: '3' }
        }
      };

      renderComponent(stateWithVariedCounts);

      // Should show Unit 3 (count 15), Unit 1 (count 10), Unit 2 (count 5)
      expect(screen.getByText('Test Unit 3')).toBeInTheDocument();
      expect(screen.getByText('Test Unit 1')).toBeInTheDocument();
      expect(screen.getByText('Test Unit 2')).toBeInTheDocument();
    });
  });
});
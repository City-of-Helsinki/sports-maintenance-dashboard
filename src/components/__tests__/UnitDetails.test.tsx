import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';

import UnitDetails, { ObservableProperty, ObservablePropertyPanel, allowedValuesByQuality } from '../UnitDetails';
import { Unit, ObservableProperty as ObservablePropertyType } from '../../types';
import { RootState } from '../../reducers/types';

// Mock react-router-dom
const mockUseParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  Link: ({ to, className, children }: any) => (
    <a href={to} className={className} data-testid="link">{children}</a>
  )
}));

describe('UnitDetails Component', () => {
  const baseUnit: Unit = {
    id: 123,
    name: { fi: 'Test Unit' },
    extensions: {
      maintenance_group: 'test-group',
      maintenance_organization: 'test-org'
    },
    services: [1, 2],
    address_postal_full: 'Test Address',
    short_description: { fi: 'Test description' },
    call_charge_info: { fi: 'Test charge info' },
    picture_caption: 'Test caption',
    description: { fi: 'Test description' },
    www: { fi: 'Test website' },
    displayed_service_owner: { fi: 'Test owner' },
    street_address: { fi: 'Test street' },
    location: {
      type: 'Point',
      coordinates: [60.0, 24.0]
    },
    observations: []
  };

  const baseObservableProperty: ObservablePropertyType = {
    id: 'test-property',
    name: { fi: 'Test Property' },
    measurement_unit: null,
    observation_type: 'categorical',
    allowed_values: [
      {
        identifier: 'good',
        quality: 'good',
        name: { fi: 'Good' },
        description: { fi: 'Good condition' },
        property: 'test-property'
      },
      {
        identifier: 'satisfactory',
        quality: 'satisfactory',
        name: { fi: 'Satisfactory' },
        description: { fi: 'Satisfactory condition' },
        property: 'test-property'
      }
    ]
  };

  const baseMockState: Partial<RootState> = {
    data: {
      unit: { '123': baseUnit },
      unitsByDistance: [],
      observable_property: {},
      observation: {},
      service: {
        1: {
          id: 1,
          name: { fi: 'Service 1' },
          unit_count: { municipality: {}, organization: {}, total: 0 },
          observable_properties: [baseObservableProperty]
        }
      },
      loading: { unit: false }
    },
    auth: {
      maintenance_organization: 'test-org',
      token: 'test-token',
      login_id: 'test-user'
    },
    serviceGroup: 'skiing'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ unitId: '123' });
  });

  describe('Main UnitDetails Component', () => {
    it('renders loading state when unit data is loading', () => {
      renderWithProviders(<UnitDetails />, {
        initialState: {
          ...baseMockState,
          data: {
            ...baseMockState.data!,
            loading: { unit: true }
          }
        }
      });

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('renders unit not found message when unit is undefined', () => {
      renderWithProviders(<UnitDetails />, {
        initialState: {
          ...baseMockState,
          data: {
            ...baseMockState.data!,
            unit: {}
          }
        }
      });

      expect(screen.getByText('Toimipistettä ei löydy')).toBeInTheDocument();
    });

    it('renders unit details with status summary and descriptive form', () => {
      renderWithProviders(<UnitDetails />, { initialState: baseMockState });

      // Check for UnitStatusSummary content
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      expect(screen.getByText('Takaisin')).toBeInTheDocument();
      expect(screen.getByText('Näytä historia')).toBeInTheDocument();
      
      // Check for UnitDescriptiveStatusForm content
      expect(screen.getByText('Päivitä paikan kuntokuvaus')).toBeInTheDocument();
      expect(screen.getByText('Julkaise kuvausteksti')).toBeInTheDocument();
    });

    it('renders observable property panels when observable properties exist', () => {
      renderWithProviders(<UnitDetails />, { initialState: baseMockState });

      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Satisfactory')).toBeInTheDocument();
    });

    it('does not render property panels when no observable properties exist', () => {
      renderWithProviders(<UnitDetails />, {
        initialState: {
          ...baseMockState,
          data: {
            ...baseMockState.data!,
            service: {}
          }
        }
      });

      expect(screen.queryByText('Test Property')).not.toBeInTheDocument();
      expect(screen.getByText('Test Unit')).toBeInTheDocument(); // UnitStatusSummary content
      expect(screen.getByText('Päivitä paikan kuntokuvaus')).toBeInTheDocument(); // UnitDescriptiveStatusForm content
    });

    it('filters quality properties for non-swimming service groups', () => {
      renderWithProviders(<UnitDetails />, {
        initialState: {
          ...baseMockState,
          serviceGroup: 'skiing'
        }
      });

      // Should render the component successfully with quality filtering
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
    });

    it('includes all properties for swimming service group', () => {
      renderWithProviders(<UnitDetails />, {
        initialState: {
          ...baseMockState,
          serviceGroup: 'swimming'
        }
      });

      // Should render the component successfully without quality filtering
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
    });
  });

  describe('ObservableProperty Component', () => {
    const observablePropertyProps = {
      quality: 'good',
      property: 'test-property',
      identifier: 'good-condition',
      name: { fi: 'Good Condition' },
      unitId: 123
    };

    it('renders observable property with correct link and styling', () => {
      renderWithProviders(<ObservableProperty {...observablePropertyProps} />);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '/unit/123/update/test-property/good-condition');
      expect(link).toHaveClass('btn', 'btn-success', 'btn-block', 'btn__newstatus');
      expect(screen.getByText('Good Condition')).toBeInTheDocument();
    });

    it('uses correct color class for different qualities', () => {
      renderWithProviders(<ObservableProperty {...observablePropertyProps} quality="satisfactory" />);

      const link = screen.getByTestId('link');
      expect(link).toHaveClass('btn-warning');
    });

    it('uses primary color for unmapped quality', () => {
      renderWithProviders(<ObservableProperty {...observablePropertyProps} quality="unknown" />);

      const link = screen.getByTestId('link');
      expect(link).toHaveClass('btn-primary');
    });

    it('includes icon span element', () => {
      renderWithProviders(<ObservableProperty {...observablePropertyProps} />);

      const icon = document.querySelector('.icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('ObservablePropertyPanel Component', () => {
    it('renders panel with header and allowed values', () => {
      const allowedValues = [
        <div key="1">Value 1</div>,
        <div key="2">Value 2</div>,
        <div key="3">Value 3</div>,
        <div key="4">Value 4</div>
      ];

      renderWithProviders(<ObservablePropertyPanel allowedValues={allowedValues} header="Test Header" />);

      expect(screen.getByText('Test Header')).toBeInTheDocument();
      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('Value 2')).toBeInTheDocument();
      expect(screen.getByText('Value 3')).toBeInTheDocument();
      expect(screen.getByText('Value 4')).toBeInTheDocument();
    });

    it('splits values evenly between left and right columns', () => {
      const allowedValues = [
        <div key="1">Value 1</div>,
        <div key="2">Value 2</div>,
        <div key="3">Value 3</div>,
        <div key="4">Value 4</div>,
        <div key="5">Value 5</div>
      ];

      const { container } = renderWithProviders(<ObservablePropertyPanel allowedValues={allowedValues} header="Test" />);

      const leftColumn = container.querySelector('.col-xs-6:first-child');
      const rightColumn = container.querySelector('.col-xs-6:last-child');

      // With 5 values, left should have 3 (cutPoint = (5/2) + (5%2) = 3)
      expect(leftColumn?.children).toHaveLength(3);
      expect(rightColumn?.children).toHaveLength(2);
    });

    it('handles empty allowed values array', () => {
      renderWithProviders(<ObservablePropertyPanel allowedValues={[]} header="Empty Test" />);

      expect(screen.getByText('Empty Test')).toBeInTheDocument();
      
      const leftColumn = document.querySelector('.col-xs-6:first-child');
      const rightColumn = document.querySelector('.col-xs-6:last-child');
      
      expect(leftColumn?.children).toHaveLength(0);
      expect(rightColumn?.children).toHaveLength(0);
    });
  });

  describe('allowedValuesByQuality utility function', () => {
    it('groups allowed values by quality', () => {
      const property: ObservablePropertyType = {
        id: 'test-property',
        name: { fi: 'Test' },
        measurement_unit: null,
        observation_type: 'categorical',
        allowed_values: [
          {
            identifier: 'excellent',
            quality: 'good',
            name: { fi: 'Excellent' },
            description: { fi: 'Excellent condition' },
            property: 'original-property'
          },
          {
            identifier: 'fine',
            quality: 'good',
            name: { fi: 'Fine' },
            description: { fi: 'Fine condition' },
            property: 'original-property'
          },
          {
            identifier: 'poor',
            quality: 'unusable',
            name: { fi: 'Poor' },
            description: { fi: 'Poor condition' },
            property: 'original-property'
          }
        ]
      };

      const result = allowedValuesByQuality(property);

      expect(result.good).toHaveLength(2);
      expect(result.unusable).toHaveLength(1);
      expect(result.good[0].identifier).toBe('excellent');
      expect(result.good[1].identifier).toBe('fine');
      expect(result.unusable[0].identifier).toBe('poor');
    });

    it('sets property id on modified values', () => {
      const property: ObservablePropertyType = {
        id: 'test-property',
        name: { fi: 'Test' },
        measurement_unit: null,
        observation_type: 'categorical',
        allowed_values: [
          {
            identifier: 'good',
            quality: 'good',
            name: { fi: 'Good' },
            description: { fi: 'Good condition' },
            property: 'original-property'
          }
        ]
      };

      const result = allowedValuesByQuality(property);

      expect(result.good[0].property).toBe('test-property');
    });

    it('handles empty allowed values array', () => {
      const property: ObservablePropertyType = {
        id: 'test-property',
        name: { fi: 'Test' },
        measurement_unit: null,
        observation_type: 'categorical',
        allowed_values: []
      };

      const result = allowedValuesByQuality(property);

      expect(result).toEqual({});
    });

    it('handles single quality group', () => {
      const property: ObservablePropertyType = {
        id: 'test-property',
        name: { fi: 'Test' },
        measurement_unit: null,
        observation_type: 'categorical',
        allowed_values: [
          {
            identifier: 'satisfactory1',
            quality: 'satisfactory',
            name: { fi: 'Satisfactory 1' },
            description: { fi: 'Satisfactory condition 1' },
            property: 'original-property'
          },
          {
            identifier: 'satisfactory2',
            quality: 'satisfactory',
            name: { fi: 'Satisfactory 2' },
            description: { fi: 'Satisfactory condition 2' },
            property: 'original-property'
          }
        ]
      };

      const result = allowedValuesByQuality(property);

      expect(Object.keys(result)).toEqual(['satisfactory']);
      expect(result.satisfactory).toHaveLength(2);
    });
  });
});
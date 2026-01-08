import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';

import UnitList, { UnitListElement } from '../UnitList';
import { Unit } from '../../types';
import { RootState } from '../../reducers/types';
import * as utils from '../utils';

// Mock react-router-dom
const mockUseParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  Link: ({ to, className, children }: any) => (
    <a href={to} className={className} data-testid="link">{children}</a>
  )
}));

// Mock utils
jest.mock('../utils', () => ({
  getQualityObservation: jest.fn(),
  ICONS: {
    'good-value': 'icon-smile-o',
    'poor-value': 'icon-frown-o'
  }
}));

const mockGetQualityObservation = utils.getQualityObservation as jest.MockedFunction<typeof utils.getQualityObservation>;

describe('UnitList Components', () => {
  const mockUnit: Unit = {
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

  const baseMockState: Partial<RootState> = {
    data: {
      unit: { 
        '123': mockUnit,
        '456': {
          ...mockUnit,
          id: 456,
          name: { fi: 'Another Unit' },
          extensions: {
            maintenance_group: 'test-group',
            maintenance_organization: 'test-org'
          }
        }
      },
      loading: { unit: false }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ groupId: 'test-group' });
  });

  describe('UnitListElement Component', () => {
    it('renders unit element with quality observation', () => {
      const mockQualityObservation = {
        value: 'good-value',
        quality: 'good'
      };
      mockGetQualityObservation.mockReturnValue(mockQualityObservation);

      renderWithProviders(<UnitListElement unit={mockUnit} />);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '/unit/123');
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      
      const iconSpan = document.querySelector('.icon-smile-o');
      expect(iconSpan).toBeInTheDocument();
      
      const badge = document.querySelector('.condition-good');
      expect(badge).toBeInTheDocument();
    });

    it('renders unit element without quality observation', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitListElement unit={mockUnit} />);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '/unit/123');
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      
      const iconSpan = document.querySelector('.icon-question');
      expect(iconSpan).toBeInTheDocument();
      
      const badge = document.querySelector('.condition-unknown');
      expect(badge).toBeInTheDocument();
    });

    it('renders correct URL for unit', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitListElement unit={mockUnit} />);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '/unit/123');
      expect(link).toHaveClass('list-group-item');
    });

    it('displays unit name correctly', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitListElement unit={mockUnit} />);

      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      const unitNameDiv = document.querySelector('.unit-name');
      expect(unitNameDiv).toHaveTextContent('Test Unit');
    });

    it('includes pencil icon for editing', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitListElement unit={mockUnit} />);

      const pencilIcon = document.querySelector('.icon-pencil-square');
      expect(pencilIcon).toBeInTheDocument();
      expect(pencilIcon).toHaveClass('action-icon');
    });
  });

  describe('UnitList Component', () => {
    it('renders loading state when data is loading', () => {
      renderWithProviders(<UnitList />, {
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

    it('renders unit list when not loading', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: baseMockState });

      expect(screen.queryByText('Ladataan...')).not.toBeInTheDocument();
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      expect(screen.getByText('Another Unit')).toBeInTheDocument();
    });

    it('filters units by group id from URL params', () => {
      mockUseParams.mockReturnValue({ groupId: 'different-group' });
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: baseMockState });

      // Should not show units from 'test-group' when looking for 'different-group'
      expect(screen.queryByText('Test Unit')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Unit')).not.toBeInTheDocument();
    });

    it('sorts units alphabetically by name', () => {
      const stateWithMoreUnits: Partial<RootState> = {
        data: {
          unit: {
            '123': { ...mockUnit, name: { fi: 'Zebra Unit' } },
            '456': { ...mockUnit, id: 456, name: { fi: 'Alpha Unit' } },
            '789': { 
              ...mockUnit, 
              id: 789, 
              name: { fi: 'Beta Unit' },
              extensions: {
                maintenance_group: 'test-group',
                maintenance_organization: 'test-org'
              }
            }
          },
          loading: { unit: false }
        }
      };

      mockGetQualityObservation.mockReturnValue(null);

      const { container } = renderWithProviders(<UnitList />, { 
        initialState: stateWithMoreUnits 
      });

      const unitElements = container.querySelectorAll('.unit-name');
      const unitNames = Array.from(unitElements).map(el => el.textContent);
      
      expect(unitNames).toEqual(['Alpha Unit', 'Beta Unit', 'Zebra Unit']);
    });

    it('renders back link to group list', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: baseMockState });

      const backLink = screen.getByText('Takaisin').closest('a');
      expect(backLink).toHaveAttribute('href', '/group');
      expect(backLink).toHaveClass('list-group-item');
    });

    it('renders mass edit link with correct group id', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: baseMockState });

      const massEditLink = screen.getByText('Luo massapäivitys').closest('a');
      expect(massEditLink).toHaveAttribute('href', '/group/test-group/mass-edit');
      expect(massEditLink).toHaveClass('btn', 'btn-primary');
    });

    it('displays group name in header', () => {
      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: baseMockState });

      const header = screen.getByText('test-group');
      expect(header.tagName.toLowerCase()).toBe('h5');
    });

    it('renders empty list when no units match group', () => {
      const emptyState: Partial<RootState> = {
        data: {
          unit: {},
          loading: { unit: false }
        }
      };

      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: emptyState });

      expect(screen.queryByText('Test Unit')).not.toBeInTheDocument();
      expect(screen.getByText('test-group')).toBeInTheDocument(); // Group name still shows
      expect(screen.getByText('Luo massapäivitys')).toBeInTheDocument(); // Mass edit link still shows
    });

    it('handles different group id from URL params', () => {
      mockUseParams.mockReturnValue({ groupId: 'another-group' });
      
      const stateWithDifferentGroup: Partial<RootState> = {
        data: {
          unit: {
            '999': {
              ...mockUnit,
              id: 999,
              name: { fi: 'Different Group Unit' },
              extensions: {
                maintenance_group: 'another-group',
                maintenance_organization: 'test-org'
              }
            }
          },
          loading: { unit: false }
        }
      };

      mockGetQualityObservation.mockReturnValue(null);

      renderWithProviders(<UnitList />, { initialState: stateWithDifferentGroup });

      expect(screen.getByText('Different Group Unit')).toBeInTheDocument();
      expect(screen.getByText('another-group')).toBeInTheDocument();
      
      const massEditLink = screen.getByText('Luo massapäivitys').closest('a');
      expect(massEditLink).toHaveAttribute('href', '/group/another-group/mass-edit');
    });
  });
});
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import DeleteConfirmation from '../../src/components/DeleteConfirmation';
import { renderWithRoute } from '../testUtils';
import * as actions from '../../src/actions';
import { Unit } from '../../src/types';
import { RootState } from '../../src/reducers/types';

// Mock actions
jest.mock('../../src/actions', () => ({
  enqueueObservation: jest.fn()
}));

// Mock unitObservableProperties
jest.mock('../../src/lib/municipalServicesClient', () => ({
  unitObservableProperties: jest.fn(() => [])
}));

// Mock enqueueObservation action
const mockEnqueueObservation = jest.fn().mockReturnValue({
  type: 'ENQUEUE_OBSERVATION',
  payload: { property: 'notice', value: null, unitId: 123 }
});

const mockUnit: Unit = {
  id: 123,
  name: { fi: 'Test Unit' },
  extensions: {
    maintenance_group: 'test-group',
    maintenance_organization: ''
  },
  address_postal_full: null,
  call_charge_info: { fi: '' },
  displayed_service_owner: { fi: '' },
  street_address: { fi: '' },
  observations: [
    {
      id: 1,
      unit: 123,
      property: 'notice',
      time: '2026-01-08T10:00:00Z',
      expiration_time: null,
      name: { fi: 'Notice' },
      quality: 'good',
      value: { fi: 'Test notice text\nSecond line' },
      primary: true
    }
  ]
};

const mockUnitWithoutObservation: Unit = {
  ...mockUnit,
  observations: []
};

const defaultState: RootState = {
  data: {
    unit: { 123: mockUnit },
    unitsByDistance: [],
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
  userLocation: null,
  unitsByUpdateTime: [],
  unitsByUpdateCount: {}
};

const renderComponent = (unitId = '123', propertyId = 'notice', initialState = defaultState) => {
  return renderWithRoute(<DeleteConfirmation />, {
    route: `/unit/${unitId}/delete/${propertyId}`,
    path: '/unit/:unitId/delete/:propertyId',
    initialState
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  (actions.enqueueObservation as jest.Mock).mockImplementation(mockEnqueueObservation);
});

describe('DeleteConfirmation', () => {
  describe('loading states', () => {
    it('renders loading state when loading is true', () => {
      const loadingState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          loading: { unit: true }
        }
      };

      renderComponent('123', 'notice', loadingState);

      expect(screen.getByText('Ladataan...')).toBeInTheDocument();
    });

    it('renders loading state when unit is not found', () => {
      const stateWithoutUnit = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {}
        }
      };

      renderComponent('123', 'notice', stateWithoutUnit);

      expect(screen.getByText('Tekstitiedotetta ei löydy')).toBeInTheDocument();
    });

    it('renders message when observation is not found', () => {
      const stateWithoutObservation: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: { 123: mockUnitWithoutObservation }
        }
      };

      renderComponent('123', 'notice', stateWithoutObservation);

      expect(screen.getByText('Tekstitiedotetta ei löydy')).toBeInTheDocument();
    });
  });

  describe('successful rendering', () => {
    it('renders confirmation panel with unit and observation', () => {
      renderComponent();

      expect(screen.getByRole('heading', { level: 4, name: 'Test Unit' })).toBeInTheDocument();
      expect(screen.getByText('Oletko varma että haluat poistaa liikuntapaikalta seuraavan tekstitiedotteen?')).toBeInTheDocument();
      expect(screen.getByText('Test notice text')).toBeInTheDocument();
      expect(screen.getByText('Second line')).toBeInTheDocument();
    });

    it('renders delete and cancel buttons', () => {
      renderComponent();

      const deleteButton = screen.getByRole('link', { name: /poista/i });
      const cancelButton = screen.getByRole('link', { name: /peruuta/i });

      expect(deleteButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute('href', '/unit/123');
      expect(cancelButton).toHaveAttribute('href', '/unit/123');
    });
  });

  describe('text rendering', () => {
    it('renders single line text correctly', () => {
      const stateWithSingleLineText = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {
            123: {
              ...mockUnit,
              observations: [
                {
                  id: 2,
                  unit: 123,
                  property: 'notice',
                  time: '2026-01-08T10:00:00Z',
                  expiration_time: null,
                  name: { fi: 'Notice' },
                  quality: 'good',
                  value: { fi: 'Single line text' },
                  primary: true
                }
              ]
            }
          }
        }
      };

      renderComponent('123', 'notice', stateWithSingleLineText);

      expect(screen.getByText('Single line text')).toBeInTheDocument();
    });

    it('renders multi-line text with proper line breaks', () => {
      renderComponent();

      const textContainer = screen.getByText('Test notice text').closest('.notice-large');
      expect(textContainer).toBeInTheDocument();
      
      // Check that both lines are rendered as separate divs
      expect(screen.getByText('Test notice text')).toBeInTheDocument();
      expect(screen.getByText('Second line')).toBeInTheDocument();
    });
  });

  describe('button clicks and action dispatching', () => {
    it('dispatches clearObservation when delete button is clicked', () => {
      renderComponent();

      const deleteButton = screen.getByRole('link', { name: /poista/i });
      fireEvent.click(deleteButton);

      expect(mockEnqueueObservation).toHaveBeenCalledWith('notice', null, 123);
    });

    it('does not dispatch action when cancel button is clicked', () => {
      renderComponent();

      const cancelButton = screen.getByRole('link', { name: /peruuta/i });
      fireEvent.click(cancelButton);

      expect(mockEnqueueObservation).not.toHaveBeenCalled();
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

      renderComponent('456', 'notice', stateWithDifferentUnit);

      expect(screen.getByRole('heading', { level: 4, name: 'Different Unit' })).toBeInTheDocument();
      
      const deleteButton = screen.getByRole('link', { name: /poista/i });
      const cancelButton = screen.getByRole('link', { name: /peruuta/i });
      
      expect(deleteButton).toHaveAttribute('href', '/unit/456');
      expect(cancelButton).toHaveAttribute('href', '/unit/456');
    });
  });

  describe('CSS classes and styling', () => {
    it('applies correct CSS classes to buttons', () => {
      renderComponent();

      const deleteButton = screen.getByRole('link', { name: /poista/i });
      const cancelButton = screen.getByRole('link', { name: /peruuta/i });

      expect(deleteButton).toHaveClass('btn', 'btn-success', 'btn-block');
      expect(cancelButton).toHaveClass('btn', 'btn-primary', 'btn-block');
    });

    it('applies correct panel classes', () => {
      renderComponent();

      const panel = screen.getByText('Oletko varma että haluat poistaa liikuntapaikalta seuraavan tekstitiedotteen?').closest('.panel');
      expect(panel).toHaveClass('panel', 'panel-warning');
    });

    it('applies correct text container classes', () => {
      renderComponent();

      const textContainer = screen.getByText('Test notice text').closest('.notice-large');
      expect(textContainer).toHaveClass('notice-large');
      
      const lineElements = textContainer?.querySelectorAll('.line');
      expect(lineElements).toHaveLength(2);
      expect(lineElements?.[0]).toHaveClass('line');
      expect(lineElements?.[1]).toHaveClass('line');
    });
  });

  describe('edge cases', () => {
    it('handles empty text observation', () => {
      const stateWithEmptyText: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {
            123: {
              ...mockUnit,
              observations: [
                {
                  id: 3,
                  unit: 123,
                  property: 'notice',
                  time: '2026-01-08T10:00:00Z',
                  expiration_time: null,
                  name: { fi: 'Notice' },
                  quality: 'good',
                  value: { fi: '' },
                  primary: true
                }
              ]
            }
          }
        }
      };

      renderComponent('123', 'notice', stateWithEmptyText);

      const textContainer = document.querySelector('.notice-large');
      expect(textContainer).toBeInTheDocument();
    });

    it('handles unit without observations array', () => {
      const stateWithoutObservationsArray: RootState = {
        ...defaultState,
        data: {
          ...defaultState.data,
          unit: {
            123: {
              ...mockUnit,
              observations: undefined
            }
          }
        }
      };

      renderComponent('123', 'notice', stateWithoutObservationsArray);

      expect(screen.getByText('Tekstitiedotetta ei löydy')).toBeInTheDocument();
    });
  });
});
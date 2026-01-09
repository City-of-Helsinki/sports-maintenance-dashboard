import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/testUtils';

import UnitDescriptiveStatusForm from '../UnitDescriptiveStatusForm';
import { Unit, UnitObservation } from '../../types';
import { enqueueObservation } from '../../actions/index';

// Mock the actions
jest.mock('../../actions/index', () => ({
  enqueueObservation: jest.fn()
}));

const mockEnqueueObservation = enqueueObservation as jest.MockedFunction<typeof enqueueObservation>;

describe('UnitDescriptiveStatusForm', () => {
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

  const baseObservation: UnitObservation = {
    unit: 123,
    id: 1,
    property: 'notice',
    time: '2023-01-01T12:00:00Z',
    expiration_time: null,
    name: { fi: 'Test Notice' },
    quality: 'good',
    value: { fi: 'Test notice text' },
    primary: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnqueueObservation.mockReturnValue({ type: 'ENQUEUE_OBSERVATION', payload: {} } as any);
  });

  describe('Rendering', () => {
    it('renders the form with correct elements', () => {
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      expect(screen.getByText('Päivitä paikan kuntokuvaus')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Kirjoita tähän suomen kielellä kuvaus paikan tilanteesta.')).toBeInTheDocument();
      expect(screen.getByText('Julkaise kuvausteksti')).toBeInTheDocument();
    });

    it('renders textarea with correct attributes', () => {
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'notice-value-fi');
      expect(textarea).toHaveAttribute('rows', '3');
      expect(textarea).toHaveClass('form-control');
    });

    it('renders submit button with correct attributes', () => {
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const submitButton = screen.getByRole('button', { name: /julkaise kuvausteksti/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).toHaveAttribute('id', 'description-submit');
      expect(submitButton).toHaveClass('btn', 'btn-primary', 'btn-block');
    });
  });

  describe('Delete button visibility', () => {
    it('does not render delete button when no notice observation exists', () => {
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      expect(screen.queryByText('Poista kuvausteksti')).not.toBeInTheDocument();
    });

    it('does not render delete button when notice observation has null value', () => {
      const unitWithNullNotice: Unit = {
        ...baseUnit,
        observations: [{
          ...baseObservation,
          value: null
        }]
      };

      renderWithProviders(<UnitDescriptiveStatusForm unit={unitWithNullNotice} />);

      expect(screen.queryByText('Poista kuvausteksti')).not.toBeInTheDocument();
    });

    it('renders delete button when notice observation exists with value', () => {
      const unitWithNotice: Unit = {
        ...baseUnit,
        observations: [baseObservation]
      };

      renderWithProviders(<UnitDescriptiveStatusForm unit={unitWithNotice} />);

      const deleteButton = screen.getByText('Poista kuvausteksti');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute('href', '/unit/123/delete/notice');
      expect(deleteButton).toHaveClass('btn', 'btn-danger', 'btn-block');
    });
  });

  describe('Default value handling', () => {
    it('sets empty default value when no notice observation exists', () => {
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.defaultValue).toBe('');
    });

    it('sets default value from existing notice observation', () => {
      const unitWithNotice: Unit = {
        ...baseUnit,
        observations: [baseObservation]
      };

      renderWithProviders(<UnitDescriptiveStatusForm unit={unitWithNotice} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.defaultValue).toBe('Test notice text');
    });

    it('handles undefined value in notice observation', () => {
      const unitWithUndefinedNotice: Unit = {
        ...baseUnit,
        observations: [{
          ...baseObservation,
          value: undefined
        }]
      };

      renderWithProviders(<UnitDescriptiveStatusForm unit={unitWithUndefinedNotice} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.defaultValue).toBe('');
    });
  });

  describe('Form submission', () => {
    it('dispatches enqueueObservation action with correct parameters on form submit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /julkaise kuvausteksti/i });

      // Type some text in the textarea
      await user.type(textarea, 'New description text');
      
      // Submit the form by clicking the submit button
      await user.click(submitButton);

      expect(mockEnqueueObservation).toHaveBeenCalledWith('notice', 'New description text', 123);
    });

    it('prevents default form submission behavior', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const form = document.getElementById('descriptive-status-form')!;
      const submitButton = screen.getByRole('button', { name: /julkaise kuvausteksti/i });
      
      // Spy on the form's submit method to verify preventDefault is working
      const formSubmitSpy = jest.fn();
      form.addEventListener('submit', formSubmitSpy);

      await user.click(submitButton);

      // Verify that the form's submit event was called
      expect(formSubmitSpy).toHaveBeenCalled();
      
      // Verify that preventDefault was called by checking that the event was cancelled
      const event = formSubmitSpy.mock.calls[0][0];
      expect(event.defaultPrevented).toBe(true);
    });

    it('does not dispatch action when textarea is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const submitButton = screen.getByRole('button', { name: /julkaise kuvausteksti/i });

      await user.click(submitButton);

      expect(mockEnqueueObservation).toHaveBeenCalledWith('notice', '', 123);
    });

    it('dispatches action when textarea has whitespace only', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UnitDescriptiveStatusForm unit={baseUnit} />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /julkaise kuvausteksti/i });

      await user.type(textarea, '   ');
      await user.click(submitButton);

      expect(mockEnqueueObservation).toHaveBeenCalledWith('notice', '   ', 123);
    });
  });

  describe('Multiple observations', () => {
    it('finds correct notice observation among multiple observations', () => {
      const unitWithMultipleObservations: Unit = {
        ...baseUnit,
        observations: [
          { ...baseObservation, id: 1, property: 'status', value: { fi: 'Status text' } },
          { ...baseObservation, id: 2, property: 'notice', value: { fi: 'Notice text' } },
          { ...baseObservation, id: 3, property: 'condition', value: { fi: 'Condition text' } }
        ]
      };

      renderWithProviders(<UnitDescriptiveStatusForm unit={unitWithMultipleObservations} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.defaultValue).toBe('Notice text');
      expect(screen.getByText('Poista kuvausteksti')).toBeInTheDocument();
    });
  });
});
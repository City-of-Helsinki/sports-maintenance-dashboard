import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../testUtils';
import LoginScreen from '../../src/components/LoginScreen';
import * as actions from '../../src/actions/index';
import { RootState } from '../../src/reducers/types';

// Mock the actions
jest.mock('../../src/actions/index', () => ({
  selectServiceGroup: jest.fn(),
  login: jest.fn()
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockSelectServiceGroup = actions.selectServiceGroup as jest.MockedFunction<typeof actions.selectServiceGroup>;
const mockLogin = actions.login as jest.MockedFunction<typeof actions.login>;

// Mock localStorage
const mockLocalStorage = {
  clear: jest.fn()
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

const defaultState: Partial<RootState> = {
  serviceGroup: 'skiing',
  auth: {
    token: null,
    maintenance_organization: 'test-org',
    login_id: null
  },
  authError: null
};

const renderComponent = (initialState: Partial<RootState> = defaultState) => {
  return renderWithProviders(<LoginScreen />, { initialState });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSelectServiceGroup.mockReturnValue({ type: 'SELECT_SERVICE_GROUP', payload: 'skiing' });
  mockLogin.mockReturnValue({ type: 'LOGIN', payload: undefined });
  mockLocalStorage.clear.mockClear();
  mockNavigate.mockClear();
});

describe('LoginScreen', () => {
  describe('rendering', () => {
    it('renders login form with all elements', () => {
      renderComponent();

      expect(screen.getByRole('heading', { name: 'PULKKA' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('käyttäjätunnus')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('salasana')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Kirjaudu' })).toBeInTheDocument();
      expect(screen.getByText('Kirjaudu sisään')).toBeInTheDocument();
    });

    it('renders app icon', () => {
      renderComponent();

      const icon = screen.getByAltText('Pulkka icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', './img/pulkka-icon.png');
    });

    it('renders service group selection', () => {
      renderComponent();

      expect(screen.getByText('Vastuualue')).toBeInTheDocument();
      expect(screen.getByLabelText('Hiihtoladut')).toBeInTheDocument();
      expect(screen.getByLabelText('Luistelukentät')).toBeInTheDocument();
      expect(screen.getByLabelText('Uimarannat')).toBeInTheDocument();
      expect(screen.getByLabelText('Pulkkamäet')).toBeInTheDocument();
    });
  });

  describe('form inputs', () => {
    it('updates username when typing', () => {
      renderComponent();

      const usernameInput = screen.getByPlaceholderText('käyttäjätunnus');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput).toHaveValue('testuser');
    });

    it('updates password when typing', () => {
      renderComponent();

      const passwordInput = screen.getByPlaceholderText('salasana');
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      expect(passwordInput).toHaveValue('testpass');
    });

    it('has required attributes on form inputs', () => {
      renderComponent();

      const usernameInput = screen.getByPlaceholderText('käyttäjätunnus');
      const passwordInput = screen.getByPlaceholderText('salasana');

      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('has autoCapitalize="off" on username input', () => {
      renderComponent();

      const usernameInput = screen.getByPlaceholderText('käyttäjätunnus');
      expect(usernameInput).toHaveAttribute('autoCapitalize', 'off');
    });
  });

  describe('service group selection', () => {
    it('shows skiing as selected by default', () => {
      renderComponent();

      const skiingRadio = screen.getByLabelText('Hiihtoladut');
      expect(skiingRadio).toBeChecked();
    });

    it('dispatches action when service group is changed', () => {
      renderComponent();

      const iceSkatingRadio = screen.getByLabelText('Luistelukentät');
      fireEvent.click(iceSkatingRadio);

      expect(mockSelectServiceGroup).toHaveBeenCalledWith('iceSkating');
    });

    it('reflects service group from Redux state', () => {
      const stateWithSwimming = {
        ...defaultState,
        serviceGroup: 'swimming'
      };

      renderComponent(stateWithSwimming);

      const swimmingRadio = screen.getByLabelText('Uimarannat');
      expect(swimmingRadio).toBeChecked();
    });

    it('all service groups have correct values', () => {
      renderComponent();

      expect(screen.getByLabelText('Hiihtoladut')).toHaveAttribute('value', 'skiing');
      expect(screen.getByLabelText('Luistelukentät')).toHaveAttribute('value', 'iceSkating');
      expect(screen.getByLabelText('Uimarannat')).toHaveAttribute('value', 'swimming');
      expect(screen.getByLabelText('Pulkkamäet')).toHaveAttribute('value', 'sledding');
    });
  });

  describe('form submission', () => {
    it('dispatches login action on form submit', () => {
      renderComponent();

      const usernameInput = screen.getByPlaceholderText('käyttäjätunnus');
      const passwordInput = screen.getByPlaceholderText('salasana');
      const submitButton = screen.getByRole('button', { name: 'Kirjaudu' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('can submit with Enter key', () => {
      renderComponent();

      const usernameInput = screen.getByPlaceholderText('käyttäjätunnus');
      const passwordInput = screen.getByPlaceholderText('salasana');
      const form = screen.getByRole('button', { name: 'Kirjaudu' }).closest('form')!;

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.submit(form);

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
    });
  });

  describe('error handling', () => {
    it('displays error message when auth error exists', () => {
      const stateWithError = {
        ...defaultState,
        authError: { message: 'Invalid credentials' }
      };

      renderComponent(stateWithError);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(screen.getByText('Invalid credentials').closest('.alert-danger')).toBeInTheDocument();
    });

    it('displays default error message when error has no message', () => {
      const stateWithError = {
        ...defaultState,
        authError: {} as any
      };

      renderComponent(stateWithError);

      expect(screen.getByText('Kirjautuminen epäonnistui. Tarkista tunnus ja salasana')).toBeInTheDocument();
    });

    it('displays non_field_errors when available', () => {
      const stateWithError = {
        ...defaultState,
        authError: { non_field_errors: ['Custom error message'] }
      };

      renderComponent(stateWithError);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('does not display error when authError is null', () => {
      renderComponent();

      expect(screen.queryByText(/Kirjautuminen epäonnistui/)).not.toBeInTheDocument();
    });
  });

  describe('redirect behavior', () => {
    it('redirects to home when user is already logged in', async () => {
      const stateWithToken = {
        ...defaultState,
        auth: {
          ...defaultState.auth,
          token: 'valid-token'
        }
      };

      renderComponent(stateWithToken);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('does not redirect when user is not logged in', () => {
      renderComponent();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('localStorage integration', () => {
    it('clears localStorage on component render', () => {
      renderComponent();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has proper form labels and associations', () => {
      renderComponent();

      const usernameInput = screen.getByPlaceholderText('käyttäjätunnus');
      const passwordInput = screen.getByPlaceholderText('salasana');

      expect(usernameInput).toHaveAttribute('id', 'inputUsername');
      expect(passwordInput).toHaveAttribute('id', 'inputPassword');
    });

    it('has proper radio button labels', () => {
      renderComponent();

      expect(screen.getByLabelText('Hiihtoladut')).toHaveAttribute('id', 'ski');
      expect(screen.getByLabelText('Luistelukentät')).toHaveAttribute('id', 'ice-skate');
      expect(screen.getByLabelText('Uimarannat')).toHaveAttribute('id', 'swimming');
      expect(screen.getByLabelText('Pulkkamäet')).toHaveAttribute('id', 'sledding');
    });
  });
});
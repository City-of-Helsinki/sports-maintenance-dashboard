import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AppRoutes from '../AppRoutes';

// Mock all the component imports to avoid deep rendering
jest.mock('../LoginScreen', () => () => <div data-testid="login-screen">LoginScreen</div>);
jest.mock('../Main', () => () => {
  const { Outlet } = require('react-router-dom');
  return (
    <div data-testid="main-component">
      <Outlet />
    </div>
  );
});
jest.mock('../DashBoard', () => () => <div data-testid="dashboard">DashBoard</div>);
jest.mock('../GroupList', () => () => <div data-testid="group-list">GroupList</div>);
jest.mock('../UnitList', () => () => <div data-testid="unit-list">UnitList</div>);
jest.mock('../UnitMassEditPropertySelect', () => () => (
  <div data-testid="unit-mass-edit-property-select">UnitMassEditPropertySelect</div>
));
jest.mock('../UnitMassEdit', () => () => <div data-testid="unit-mass-edit">UnitMassEdit</div>);
jest.mock('../UnitDetails', () => () => <div data-testid="unit-details">UnitDetails</div>);
jest.mock('../UnitHistory', () => () => <div data-testid="unit-history">UnitHistory</div>);
jest.mock('../UpdateConfirmation', () => () => (
  <div data-testid="update-confirmation">UpdateConfirmation</div>
));
jest.mock('../DeleteConfirmation', () => () => (
  <div data-testid="delete-confirmation">DeleteConfirmation</div>
));
jest.mock('../UpdateQueue', () => () => <div data-testid="update-queue">UpdateQueue</div>);
jest.mock('../NotFound', () => () => <div data-testid="not-found">NotFound</div>);

describe('AppRoutes Component', () => {
  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <AppRoutes />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Structure', () => {
    it('renders the Routes component', () => {
      renderWithRouter();
      // The component should render without errors
      expect(document.body).toBeInTheDocument();
    });

    it('renders LoginScreen for /login route', () => {
      renderWithRouter(['/login']);
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-component')).not.toBeInTheDocument();
    });

    it('renders Main component wrapper for root route', () => {
      renderWithRouter(['/']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('renders GroupList for /group route', async () => {
      renderWithRouter(['/group']);
      expect(await screen.findByTestId('group-list')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders NotFound for unknown routes', async () => {
      renderWithRouter(['/unknown-path']);
      expect(await screen.findByTestId('not-found')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });
  });

  describe('Nested Routes with Parameters', () => {
    it('renders UnitList for /group/:groupId route', async () => {
      renderWithRouter(['/group/test-group']);
      expect(await screen.findByTestId('unit-list')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders UnitDetails for /unit/:unitId route', async () => {
      renderWithRouter(['/unit/123']);
      expect(await screen.findByTestId('unit-details')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders UnitHistory for /unit/:unitId/history route', async () => {
      renderWithRouter(['/unit/123/history']);
      expect(await screen.findByTestId('unit-history')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders UnitMassEditPropertySelect for /group/:groupId/mass-edit route', async () => {
      renderWithRouter(['/group/test-group/mass-edit']);
      expect(await screen.findByTestId('unit-mass-edit-property-select')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders UnitMassEdit for /group/:groupId/mass-edit/:propertyId route', async () => {
      renderWithRouter(['/group/test-group/mass-edit/property1']);
      expect(await screen.findByTestId('unit-mass-edit')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders UpdateConfirmation for /unit/:unitId/update/:propertyId/:valueId route', async () => {
      renderWithRouter(['/unit/123/update/property1/value1']);
      expect(await screen.findByTestId('update-confirmation')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders DeleteConfirmation for /unit/:unitId/delete/:propertyId route', async () => {
      renderWithRouter(['/unit/123/delete/property1']);
      expect(await screen.findByTestId('delete-confirmation')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });

    it('renders UpdateQueue for /queue route', async () => {
      renderWithRouter(['/queue']);
      expect(await screen.findByTestId('update-queue')).toBeInTheDocument();
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
    });
  });

  describe('Route Nesting Structure', () => {
    it('does not nest login route under Main component', () => {
      renderWithRouter(['/login']);
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-component')).not.toBeInTheDocument();
    });

    it('nests all protected routes under Main component', async () => {
      const protectedRoutes = [
        '/',
        '/group',
        '/group/test-group',
        '/group/test-group/mass-edit',
        '/group/test-group/mass-edit/property1',
        '/unit/123',
        '/unit/123/history',
        '/unit/123/update/property1/value1',
        '/unit/123/delete/property1',
        '/queue',
        '/unknown-path'
      ];

      for (const route of protectedRoutes) {
        const { unmount } = renderWithRouter([route]);
        expect(await screen.findByTestId('main-component')).toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Route Matching Specificity', () => {
    it('matches most specific route for nested paths', async () => {
      // Should match /unit/:unitId/history, not /unit/:unitId
      renderWithRouter(['/unit/123/history']);
      expect(await screen.findByTestId('unit-history')).toBeInTheDocument();
      expect(screen.queryByTestId('unit-details')).not.toBeInTheDocument();
    });

    it('matches catch-all route for unmatched nested paths', async () => {
      renderWithRouter(['/unit/123/some/unknown/path']);
      expect(await screen.findByTestId('not-found')).toBeInTheDocument();
    });

    it('matches exact route for root path', () => {
      renderWithRouter(['/']);
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('group-list')).not.toBeInTheDocument();
    });
  });
});
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
      <MemoryRouter
        initialEntries={initialEntries}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
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

    it('renders GroupList for /group route', () => {
      renderWithRouter(['/group']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('group-list')).toBeInTheDocument();
    });

    it('renders NotFound for unknown routes', () => {
      renderWithRouter(['/unknown-path']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });

  describe('Nested Routes with Parameters', () => {
    it('renders UnitList for /group/:groupId route', () => {
      renderWithRouter(['/group/test-group']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('unit-list')).toBeInTheDocument();
    });

    it('renders UnitDetails for /unit/:unitId route', () => {
      renderWithRouter(['/unit/123']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('unit-details')).toBeInTheDocument();
    });

    it('renders UnitHistory for /unit/:unitId/history route', () => {
      renderWithRouter(['/unit/123/history']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('unit-history')).toBeInTheDocument();
    });

    it('renders UnitMassEditPropertySelect for /group/:groupId/mass-edit route', () => {
      renderWithRouter(['/group/test-group/mass-edit']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('unit-mass-edit-property-select')).toBeInTheDocument();
    });

    it('renders UnitMassEdit for /group/:groupId/mass-edit/:propertyId route', () => {
      renderWithRouter(['/group/test-group/mass-edit/property1']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('unit-mass-edit')).toBeInTheDocument();
    });

    it('renders UpdateConfirmation for /unit/:unitId/update/:propertyId/:valueId route', () => {
      renderWithRouter(['/unit/123/update/property1/value1']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('update-confirmation')).toBeInTheDocument();
    });

    it('renders DeleteConfirmation for /unit/:unitId/delete/:propertyId route', () => {
      renderWithRouter(['/unit/123/delete/property1']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument();
    });

    it('renders UpdateQueue for /queue route', () => {
      renderWithRouter(['/queue']);
      expect(screen.getByTestId('main-component')).toBeInTheDocument();
      expect(screen.getByTestId('update-queue')).toBeInTheDocument();
    });
  });

  describe('Route Nesting Structure', () => {
    it('does not nest login route under Main component', () => {
      renderWithRouter(['/login']);
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-component')).not.toBeInTheDocument();
    });

    it('nests all protected routes under Main component', () => {
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

      protectedRoutes.forEach(route => {
        const { unmount } = renderWithRouter([route]);
        expect(screen.getByTestId('main-component')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Route Matching Specificity', () => {
    it('matches most specific route for nested paths', () => {
      // Should match /unit/:unitId/history, not /unit/:unitId
      renderWithRouter(['/unit/123/history']);
      expect(screen.getByTestId('unit-history')).toBeInTheDocument();
      expect(screen.queryByTestId('unit-details')).not.toBeInTheDocument();
    });

    it('matches catch-all route for unmatched nested paths', () => {
      renderWithRouter(['/unit/123/some/unknown/path']);
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('matches exact route for root path', () => {
      renderWithRouter(['/']);
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('group-list')).not.toBeInTheDocument();
    });
  });
});
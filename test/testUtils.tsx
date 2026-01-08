import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { RootState } from '../src/reducers/types';

interface RenderWithProvidersOptions {
  store?: any;
  initialState?: Partial<RootState>;
}

interface RenderWithRouteOptions {
  route: string;
  path: string;
  initialState?: Partial<RootState>;
  store?: any;
}

// Create a default mock store for testing
export const createMockStore = (initialState: Partial<RootState> = {}) => {
  const defaultState: RootState = {
    data: {
      unit: {},
      unitsByDistance: [],
      observable_property: {},
      observation: {},
      service: {},
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
    unitsByUpdateCount: {},
    ...initialState
  };
  
  return createStore(() => defaultState);
};

// Helper function to render components with router and Redux store
export const renderWithProviders = (
  component: React.ReactElement,
  { store, initialState }: RenderWithProvidersOptions = {}
) => {
  const testStore = store || createMockStore(initialState);
  
  return render(
    <Provider store={testStore}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

// Helper function to render components with specific routes
export const renderWithRoute = (
  component: React.ReactElement,
  {
    route,
    path,
    initialState,
    store
  }: RenderWithRouteOptions
) => {
  const testStore = store || createMockStore(initialState);
  
  return render(
    <Provider store={testStore}>
      <MemoryRouter 
        initialEntries={[route]} 
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path={path} element={component} />
          <Route path="/unit/:unitId" element={<div>Unit Page</div>} />
          <Route path="/unit/:unitId/history" element={<div>Unit History Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};
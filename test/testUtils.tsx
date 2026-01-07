import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import { RootState } from '../../reducers/types';

// Create a default mock store for testing
const createMockStore = (initialState: Partial<RootState> = {}) => {
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
  { store, initialState }: { store?: any; initialState?: Partial<RootState> } = {}
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
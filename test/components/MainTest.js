/*eslint-env node, mocha */
/*eslint no-console: 0*/
'use strict';

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import Main from 'components/Main';

// Create a complete mock store for testing
const mockStore = createStore(() => ({
  auth: {
    token: null,
    maintenance_organization: 'test-org',
    user: { name: 'Test User' }
  },
  updateQueue: {},
  serviceGroup: 'skiing', // Use a valid service group key
  groups: [],
  units: [],
  resourceLoadingQueue: {},
  user: { isAuthenticated: false }
}));

// Helper function to render components with providers
const renderWithProviders = (component, store = mockStore) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('MainComponent', () => {

  it('should be importable', () => {
    expect(Main).to.exist;
    expect(Main).to.be.an('object');
  });

  it('should have its component name as default className', () => {
    const { container } = renderWithProviders(<Main />);
    
    const mainElement = container.querySelector('.index');
    expect(mainElement).to.exist;
  });
});

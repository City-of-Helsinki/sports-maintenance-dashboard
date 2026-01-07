/*eslint no-console: 0*/
'use strict';

import React from 'react';
import Main from 'components/Main';
import { renderWithProviders } from '../../../test/testUtils';

describe('MainComponent', () => {

  it('should be importable', () => {
    expect(Main).toBeDefined();
    expect(typeof Main).toBe('object');
  });

  it('should have its component name as default className', () => {
    const { container } = renderWithProviders(<Main />);
    
    const mainElement = container.querySelector('.index');
    expect(mainElement).toBeInTheDocument();
  });
});

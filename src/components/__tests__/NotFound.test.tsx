import React from 'react';
import { screen } from '@testing-library/react';
import NotFound from '../NotFound';
import { renderWithProviders } from '../../../test/testUtils';

describe('NotFound Component', () => {
  it('displays 404 error message in Finnish', () => {
    renderWithProviders(<NotFound />);
    
    const errorMessage = screen.getByText('404 - Sivua ei löytynyt');
    expect(errorMessage).toBeInTheDocument();
  });

  it('displays return link with correct text', () => {
    renderWithProviders(<NotFound />);
    
    const returnLink = screen.getByRole('link', { name: 'Takaisin' });
    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/');
  });
});
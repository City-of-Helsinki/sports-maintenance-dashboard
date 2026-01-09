import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';
import UnitStatusSummary from '../UnitStatusSummary';
import { Unit, UnitObservation } from '../../types';

describe('UnitStatusSummary Component', () => {
  // Base observation for tests
  const baseObservation: UnitObservation = {
    unit: 1,
    id: 123,
    property: 'test',
    time: '2024-01-15T14:30:00.000Z',
    expiration_time: null,
    name: { fi: 'Test Observation' },
    quality: 'good',
    value: { fi: 'test' },
    primary: true
  };

  // Base unit for tests
  const baseUnit: Unit = {
    id: 1,
    name: { fi: 'Test Unit' },
    extensions: {
      maintenance_group: 'group1',
      maintenance_organization: 'org1'
    },
    services: [1],
    address_postal_full: null,
    short_description: null,
    call_charge_info: { fi: '' },
    picture_caption: null,
    description: { fi: '' },
    www: { fi: '' },
    displayed_service_owner: { fi: '' },
    street_address: { fi: '' },
    location: { type: 'Point', coordinates: [0, 0] },
    observations: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders unit name correctly', () => {
    renderWithProviders(<UnitStatusSummary unit={baseUnit} />);

    expect(screen.getByText('Test Unit')).toBeInTheDocument();
  });

  it('renders back link to home', () => {
    renderWithProviders(<UnitStatusSummary unit={baseUnit} />);

    const backLink = screen.getByRole('link', { name: /takaisin/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('renders history link with correct unit id', () => {
    renderWithProviders(<UnitStatusSummary unit={baseUnit} />);

    const historyLink = screen.getByRole('link', { name: /näytä historia/i });
    expect(historyLink).toBeInTheDocument();
    expect(historyLink).toHaveAttribute('href', '/unit/1/history');
  });

  it('renders observations when unit has observations', () => {
    const unitWithObservations = {
      ...baseUnit,
      observations: [
        { ...baseObservation, id: 1, name: { fi: 'First Observation' } },
        { ...baseObservation, id: 2, name: { fi: 'Second Observation' } }
      ]
    };

    renderWithProviders(<UnitStatusSummary unit={unitWithObservations} />);

    const observationElements = screen.getAllByText('First Observation');
    expect(observationElements.length).toBeGreaterThan(0);
    const anotherObservationElements = screen.getAllByText('Second Observation');
    expect(anotherObservationElements.length).toBeGreaterThan(0);
  });

  it('renders without observations when unit has empty observations array', () => {
    renderWithProviders(<UnitStatusSummary unit={baseUnit} />);

    // Should not find any observation elements
    const observationElements = document.querySelectorAll('.unit-observation-text');
    expect(observationElements).toHaveLength(0);
  });

  it('renders quality status bar when quality observation exists', () => {
    const unitWithQualityObservation = {
      ...baseUnit,
      observations: [
        { ...baseObservation, id: 1, quality: 'unknown', name: { fi: 'Unknown' } },
        { ...baseObservation, id: 2, quality: 'good', name: { fi: 'Good Quality' } }
      ]
    };

    renderWithProviders(<UnitStatusSummary unit={unitWithQualityObservation} />);
    
    const statusBar = screen.getByText('Good Quality', { selector: '.unit-status' });
    expect(statusBar).toBeInTheDocument();
    expect(statusBar).toHaveClass('unit-status', 'unit-status--good', 'label-success');
  });

  it('does not render quality status bar when no quality observation exists', () => {
    const unitWithOnlyUnknownQuality = {
      ...baseUnit,
      observations: [
        { ...baseObservation, id: 1, quality: 'unknown', name: { fi: 'Unknown Status' } }
      ]
    };

    renderWithProviders(<UnitStatusSummary unit={unitWithOnlyUnknownQuality} />);
    
    // Should not find any element with unit-status class (quality bar should not render)
    expect(screen.queryByText('Unknown Status')?.closest('.unit-status')).not.toBeInTheDocument();
  });

  it('renders both observations and quality status bar when both exist', () => {
    const unitWithObservations = {
      ...baseUnit,
      observations: [
        { ...baseObservation, id: 1, quality: 'good', name: { fi: 'Test Observation' } },
        { ...baseObservation, id: 2, quality: 'satisfactory', name: { fi: 'Another Observation' } }
      ]
    };

    renderWithProviders(<UnitStatusSummary unit={unitWithObservations} />);

    // Should have both observations rendered
    const observationElements = document.querySelectorAll('.unit-observation-text');
    expect(observationElements).toHaveLength(2);
    
    // Should have quality status bar showing the first good quality observation
    const qualityStatusBar = screen.getAllByText('Test Observation').find(el =>
      el.className.includes('unit-status')
    );
    expect(qualityStatusBar).toBeDefined();
    expect(qualityStatusBar).toHaveClass('unit-status', 'unit-status--good', 'label-success');
  });

  it('handles unit with different id correctly', () => {
    const unitWithDifferentId = { ...baseUnit, id: 999 };

    renderWithProviders(<UnitStatusSummary unit={unitWithDifferentId} />);

    const historyLink = screen.getByRole('link', { name: /näytä historia/i });
    expect(historyLink).toHaveAttribute('href', '/unit/999/history');
  });

  it('displays correct status bar class for different qualities', () => {
    const unitWithSatisfactoryQuality = {
      ...baseUnit,
      observations: [
        { ...baseObservation, id: 1, quality: 'satisfactory', name: { fi: 'Satisfactory Quality' } }
      ]
    };

    renderWithProviders(<UnitStatusSummary unit={unitWithSatisfactoryQuality} />);

    // Get the status bar specifically (the one with unit-status class, not the observation)
    const statusBar = screen.getAllByText('Satisfactory Quality').find(el =>
      el.className.includes('unit-status')
    );
    expect(statusBar).toBeDefined();
    expect(statusBar).toHaveClass('unit-status', 'unit-status--satisfactory', 'label-warning');
  });
});
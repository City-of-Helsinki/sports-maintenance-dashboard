import React from 'react';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import ObservationItem from '../ObservationItem';
import { UnitObservation } from '../../types';

describe('ObservationItem Component', () => {
  // Set Finnish locale for these tests and restore original after
  beforeAll(() => {
    // @ts-ignore
    import('moment/locale/fi');
    moment.locale('fi');
  });

  afterAll(() => {
    moment.locale('en'); // Reset to default English locale
  });

  const mockObservation: UnitObservation = {
    unit: 1,
    id: 123,
    property: 'ski_trail_maintenance',
    time: '2024-01-15T14:30:00.000Z',
    expiration_time: null,
    name: { fi: 'Hyväksi todettu' },
    quality: 'good',
    value: { fi: 'maintained' },
    primary: true,
  };

  it('renders basic observation item with default className', () => {
    const { container } = render(<ObservationItem observation={mockObservation} />);
    
    const observationDiv = container.querySelector('.unit-observation-text');
    expect(observationDiv).toBeInTheDocument();
    expect(observationDiv).toHaveClass('unit-observation-text');
  });

  it('renders with custom className', () => {
    const { container } = render(<ObservationItem observation={mockObservation} className="custom-class" />);
    
    const observationDiv = container.querySelector('.custom-class');
    expect(observationDiv).toBeInTheDocument();
    expect(observationDiv).toHaveClass('custom-class');
  });

  it('displays correct short description for ski trail maintenance', () => {
    render(<ObservationItem observation={mockObservation} />);
    
    expect(screen.getByText(/Kunnostettu/)).toBeInTheDocument();
  });

  it('displays observation name from LocalizedText', () => {
    render(<ObservationItem observation={mockObservation} />);
    
    expect(screen.getByText('Hyväksi todettu')).toBeInTheDocument();
  });

  it('falls back to value when name is not available', () => {
    const observationWithoutName: UnitObservation = {
      ...mockObservation,
      name: { fi: '' },
      value: { fi: 'Good condition' },
    };

    render(<ObservationItem observation={observationWithoutName} />);
    
    expect(screen.getByText('Good condition')).toBeInTheDocument();
  });

  it('handles live swimming water temperature with special formatting', () => {
    const tempObservation: UnitObservation = {
      ...mockObservation,
      property: 'live_swimming_water_temperature',
      name: { fi: '22' },
    };

    render(<ObservationItem observation={tempObservation} />);
    
    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText(/Automaattinen lämpötilamittaus/)).toBeInTheDocument();
  });

  it('renders notice type observation differently', () => {
    const noticeObservation: UnitObservation = {
      ...mockObservation,
      property: 'notice',
      value: { fi: 'Important notice text' },
    };

    render(<ObservationItem observation={noticeObservation} />);
    
    expect(screen.getByText(/Tekstitiedote julkaistu/)).toBeInTheDocument();
    expect(screen.getByText('"Important notice text"')).toBeInTheDocument();
    
    const noticeContainer = screen.getByText('"Important notice text"').closest('.notice-small');
    expect(noticeContainer).toBeInTheDocument();
  });

  it('displays formatted time correctly', () => {
    render(<ObservationItem observation={mockObservation} />);
    
    // Check that Finnish time format is displayed (actual moment.js formatting with Finnish locale)
    expect(screen.getByText(new RegExp("ma 15.1.2024 klo 16.30.00"))).toBeInTheDocument();
  });

  describe('Short descriptions mapping', () => {
    const testCases = [
      { property: 'ski_trail_condition', expected: 'Kunto todettu' },
      { property: 'swimming_water_temperature', expected: 'Lämpötila todettu' },
      { property: 'swimming_water_algae', expected: 'Levätilanne todettu' },
      { property: 'live_swimming_water_temperature', expected: 'Automaattinen lämpötilamittaus' },
    ];

    testCases.forEach(({ property, expected }) => {
      it(`displays correct description for ${property}`, () => {
        const observation: UnitObservation = {
          ...mockObservation,
          property,
        };

        render(<ObservationItem observation={observation} />);
        
        expect(screen.getByText(new RegExp(expected))).toBeInTheDocument();
      });
    });
  });

  it('handles empty observation name and value gracefully', () => {
    const emptyObservation: UnitObservation = {
      ...mockObservation,
      name: { fi: '' },
      value: { fi: '' },
    };

    render(<ObservationItem observation={emptyObservation} />);
    
    // Should still render the short description
    expect(screen.getByText(/Kunnostettu/)).toBeInTheDocument();
  });
});
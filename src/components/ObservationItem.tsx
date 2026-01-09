import React from 'react';
import moment from 'moment';

import { UnitObservation } from '../types';

const SHORT_DESCRIPTIONS: Record<string, string> = {
  ski_trail_maintenance: 'Kunnostettu',
  ski_trail_condition: 'Kunto todettu',
  swimming_water_temperature: 'Lämpötila todettu',
  swimming_water_algae: 'Levätilanne todettu',
  live_swimming_water_temperature: 'Automaattinen lämpötilamittaus'
};

function getUnitObservationText(observationName: string, observationProperty: string): string {
  if (observationProperty === 'live_swimming_water_temperature') {
    return observationName + '°C';
  }
  return observationName;
}

interface ObservationItemProps {
    observation: UnitObservation;
    className?: string;
}

const ObservationItem: React.FC<ObservationItemProps> = ({ observation, className = 'unit-observation-text' }) => {
  const { id, time, property, name, value } = observation;
  const formattedTime = moment(time).format('dd l [klo] LTS');

  if (property === 'notice') {
    return (
      <div key={id} className={className}>
        <small>Tekstitiedote julkaistu {formattedTime}</small><br />
        <div className="notice-small">
          <small>"{typeof value === 'string' ? value : value?.fi}"</small>
        </div>
      </div>
    );
  }

  return (
    <div key={id} className={className}>
      <small>
        {SHORT_DESCRIPTIONS[property]}{' '}
        <strong>
          {getUnitObservationText(
            name?.fi || (typeof value === 'string' ? value : value?.fi) || '',
            property
          )}
        </strong>{' '}
        {formattedTime}
      </small>
    </div>
  );
};

export default ObservationItem;
import React from 'react';
import moment from 'moment';

const SHORT_DESCRIPTIONS = {
    ski_trail_maintenance: 'Kunnostettu',
    ski_trail_condition: 'Kunto todettu',
    swimming_water_temperature: 'Lämpötila todettu',
    swimming_water_algae: 'Levätilanne todettu',
    live_swimming_water_temperature: 'Automaattinen lämpötilamittaus'
};

function getUnitObservationText(observationName, observationProperty) {
    if (observationProperty === 'live_swimming_water_temperature') {
        return observationName + '°C';
    }
    return observationName;
}

export default function ObservationItem({ observation, className = 'unit-observation-text' }) {
  const { id, time, property, name, value } = observation;
  const formattedTime = moment(time).format('dd l [klo] LTS');

  if (property === 'notice') {
    return (
      <div key={id} className={className}>
        <small>Tekstitiedote julkaistu {formattedTime}</small><br />
        <div className="notice-small">
          <small>"{value?.fi}"</small>
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
            name?.fi || value?.fi,
            property
          )}
        </strong>{' '}
        {formattedTime}
      </small>
    </div>
  );
}

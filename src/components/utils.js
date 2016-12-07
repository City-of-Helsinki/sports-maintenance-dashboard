import _ from 'lodash';

export const QUALITIES = [
  'good', 'satisfactory', 'unusable'
];

export const COLORS = {
  satisfactory: 'warning',
  unusable: 'danger',
  good: 'success'
};

export const ICONS = {
  good: 'icon-smile-o',
  satisfactory: 'icon-meh-o',
  poor: 'icon-frown-o',
  groomed: 'icon-road',
  littered: 'icon-pagelines',
  closed: 'icon-forbidden',
  snowless: 'icon-water',
  event: 'icon-trophy',
  snowmaking: 'icon-spinner',
  frozen: 'icon-frozen',
  plowed: 'icon-plowed',
  freezing_started: 'icon-started',
  unknown: 'icon-question'
};

export function statusBarClassName(observation) {
    // TODO is label- class usage ok for non-label
  if (observation) {
    return `unit-status unit-status--${observation.quality} label-${COLORS[observation.quality]}`;
  }
  return 'unit-status';
}

export function getQualityObservation(unit) {
  if (unit === undefined) {
    return undefined;
  }
  const observations = unit.observations;
  return _.find(observations, (obs) => {
    return (obs.quality !== null && obs.quality !== undefined && obs.quality !== 'unknown');
  });
}

export function calculateGroups(units) {
  let result = {};
  _.each(units, (u) => {
    const group = result[u.extensions.maintenance_group] || [];
    result[u.extensions.maintenance_group] = group.concat(u.id);
  });
  return result;
}


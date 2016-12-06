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
  good: 'smile-o',
  satisfactory: 'meh-o',
  poor: 'frown-o',
  groomed: 'road',
  littered: 'pagelines',
  closed: 'times-circle',
  snowless: 'tint',
  event: 'trophy',
  snowmaking: 'spinner'
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


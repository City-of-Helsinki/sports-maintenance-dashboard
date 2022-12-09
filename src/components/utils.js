import moment from 'moment';
import _ from 'lodash';

export const QUALITIES = [
  'good', 'satisfactory', 'unusable', 'unknown'
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

export function calculateGroups(units, maintenanceOrg) {
  let result = {};
  _.each(units, (u) => {
    if (u.extensions.maintenance_organization == maintenanceOrg) {
      const group = result[u.extensions.maintenance_group] || [];
      result[u.extensions.maintenance_group] = group.concat(u.id);
    }
    else {
      const key = 'muut kaupungit';
      const group  = result[key] || [];
      result[key] = group.concat(u.id);
    }
  });
  return result;
}

export function getCurrentSeason() {
  // New season starts 1st of october
  const newSeasonStartDate = {
    day: 1,
    month: 10
  };

  const today = {
    day: moment().date(),
    month: moment().month() + 1, // months are zero based
    year: moment().year()
  };

  const getStartYear = () => {
    const isPastSeasonStartDate = today.month > newSeasonStartDate.month || (today.month === newSeasonStartDate.month && today.day >= newSeasonStartDate.day);
    // if today is past season start date, then start value is this year, otherwise start value is last year
    return isPastSeasonStartDate ? today.year : (today.year - 1);
  }

  const getEndYear = () => getStartYear() + 1;

  return `${getStartYear()}-${getEndYear()}`;
}

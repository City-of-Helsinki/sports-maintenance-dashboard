
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
  closed: 'forbidden',
  snowless: 'water',
  event: 'trophy',
  snowmaking: 'spinner'
};

export function statusBarClassName(observation) {
    // TODO is label- class usage ok for non-label
  return `unit-status unit-status--${observation.quality} label-${COLORS[observation.quality]}`;
}

export function backLink(component) {
  return () => {
    component.props.history.goBack();
  };
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

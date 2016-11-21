
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
    return `unit-status unit-status--${observation.quality} label-${COLORS[observation.quality]}`;
}

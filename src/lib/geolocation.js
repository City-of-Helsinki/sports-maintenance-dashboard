import _ from 'lodash';

let DISABLED;
if ('geolocation' in navigator) {
  DISABLED = false;
} else {
  DISABLED = true;
}
const STAGES = [
  'initial',
  'cacheSuccess',
  'lowAccuracySuccess',
  'highAccuracySuccess'
];

const POSITION_OPTIONS = {
  initial: {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: Infinity
  },
  cacheSuccess: {
    enableHighAccuracy: false,
    timeout: 20000,
    maximumAge: 0
  },
  lowAccuracySuccess: {
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0
  },
  highAccuracySuccess: null
};

let currentStage = 0;
function createSuccessCallback(callback) {
  return (position) => {
    currentStage++;
    var crd = position.coords;
    if (currentStage < _.size(POSITION_OPTIONS) - 1) {
      getInitialLocation(callback);
    }
    callback(position);
  };
}

function error(positionError) {
}

export function getInitialLocation(callback) {
  if (DISABLED) {
    return;
  }
  const options = POSITION_OPTIONS[STAGES[currentStage]];
  if (options) {
    navigator.geolocation.getCurrentPosition(createSuccessCallback(callback), error, options);
  }
}

export function updateLocation(callback) {

}

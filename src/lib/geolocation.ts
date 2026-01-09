import _ from 'lodash';

type Stage = 'initial' | 'cacheSuccess' | 'lowAccuracySuccess' | 'highAccuracySuccess';

type GeolocationCallback = (position: GeolocationPosition) => void;

interface StagePositionOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

// Check geolocation availability at runtime instead of module load
const isGeolocationDisabled = (): boolean => {
  return !('geolocation' in navigator);
};

const STAGES: Stage[] = [
  'initial',
  'cacheSuccess',
  'lowAccuracySuccess',
  'highAccuracySuccess'
];

const POSITION_OPTIONS: Record<Stage, StagePositionOptions | null> = {
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

function createSuccessCallback(callback: GeolocationCallback): GeolocationCallback {
  return (position: GeolocationPosition) => {
    currentStage++;
    if (currentStage < _.size(POSITION_OPTIONS) - 1) {
      getInitialLocation(callback, false); // Don't reset on subsequent calls
    }
    callback(position);
  };
}

function handleGeolocationError(error: GeolocationPositionError): void {
  // Silently handle geolocation errors to allow graceful fallback
  // Common errors: PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT
  if (process.env.NODE_ENV !== 'test') {
    console.debug('Geolocation error:', error.message);
  }
}

export function getInitialLocation(callback: GeolocationCallback, reset: boolean = true): void {
  if (isGeolocationDisabled()) {
    return;
  }
  // Reset stage for new geolocation session
  if (reset) {
    currentStage = 0;
  }
  
  const options = POSITION_OPTIONS[STAGES[currentStage]];
  if (options) {
    navigator.geolocation.getCurrentPosition(createSuccessCallback(callback), handleGeolocationError, options); // NOSONAR
  }
}
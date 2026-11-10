import * as Sentry from '@sentry/react';
import { getEnvValue } from '../util/envUtils';

// Sentry stays off unless a DSN is configured for the current environment
const dsn = getEnvValue('REACT_APP_SENTRY_DSN', process.env.REACT_APP_SENTRY_DSN);
if (dsn) {
  Sentry.init({
    dsn,
    environment: getEnvValue('REACT_APP_SENTRY_ENVIRONMENT', process.env.REACT_APP_SENTRY_ENVIRONMENT),
    release: getEnvValue('REACT_APP_SENTRY_RELEASE', process.env.REACT_APP_SENTRY_RELEASE),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_TRACES_SAMPLE_RATE', process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE) || '0'
    ),
    tracePropagationTargets: (
      getEnvValue('REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS', process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS) || ''
    )
      .split(',')
      .map((target) => target.trim())
      .filter(Boolean),
    profilesSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_PROFILES_SAMPLE_RATE', process.env.REACT_APP_SENTRY_PROFILES_SAMPLE_RATE) || '0'
    ),
    replaysSessionSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE', process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || '0'
    ),
    replaysOnErrorSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE', process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE) || '0'
    )
  });
}

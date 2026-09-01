import * as Sentry from '@sentry/react';

// Sentry stays off unless a DSN is configured for the current environment
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
    release: process.env.REACT_APP_SENTRY_RELEASE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: Number.parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || '0'),
    tracePropagationTargets: (
      process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS || ''
    ).split(','),
    profilesSampleRate: Number.parseFloat(process.env.REACT_APP_SENTRY_PROFILES_SAMPLE_RATE || '0'),
    // Org policy: Session Replay stays disabled (sample rates default to 0)
    replaysSessionSampleRate: Number.parseFloat(
      process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0'
    ),
    replaysOnErrorSampleRate: Number.parseFloat(
      process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '0'
    )
  });
}

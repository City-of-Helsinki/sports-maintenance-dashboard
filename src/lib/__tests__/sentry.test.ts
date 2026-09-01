'use strict';

const mockInit = jest.fn();
const mockBrowserTracingIntegration = jest.fn(() => 'browserTracingIntegration');
const mockBrowserProfilingIntegration = jest.fn(() => 'browserProfilingIntegration');
const mockReplayIntegration = jest.fn(() => 'replayIntegration');

jest.mock('@sentry/react', () => ({
  init: (config: unknown) => mockInit(config),
  browserTracingIntegration: () => mockBrowserTracingIntegration(),
  browserProfilingIntegration: () => mockBrowserProfilingIntegration(),
  replayIntegration: () => mockReplayIntegration()
}));

const ORIGINAL_ENV = process.env;

// The sentry module runs Sentry.init() as an import side effect, so each
// test re-imports it after resetting modules and env vars.
const importSentryModule = () => {
  jest.resetModules();
  require('../sentry');
};

describe('sentry instrumentation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.REACT_APP_SENTRY_DSN;
    delete process.env.REACT_APP_SENTRY_ENVIRONMENT;
    delete process.env.REACT_APP_SENTRY_RELEASE;
    delete process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE;
    delete process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS;
    delete process.env.REACT_APP_SENTRY_PROFILES_SAMPLE_RATE;
    delete process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
    delete process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('does not initialize Sentry when no DSN is configured', () => {
    importSentryModule();

    expect(mockInit).not.toHaveBeenCalled();
  });

  it('does not initialize Sentry when the DSN is an empty string', () => {
    process.env.REACT_APP_SENTRY_DSN = '';

    importSentryModule();

    expect(mockInit).not.toHaveBeenCalled();
  });

  it('initializes Sentry using the configured env vars when a DSN is set', () => {
    process.env.REACT_APP_SENTRY_DSN = 'https://public@example.ingest.sentry.io/1';
    process.env.REACT_APP_SENTRY_ENVIRONMENT = 'production';
    process.env.REACT_APP_SENTRY_RELEASE = '1.2.3';
    process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE = '0.5';
    process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS = 'api.hel.fi,example.com';
    process.env.REACT_APP_SENTRY_PROFILES_SAMPLE_RATE = '0.25';
    process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '0';
    process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '0';

    importSentryModule();

    expect(mockInit).toHaveBeenCalledTimes(1);
    const config = mockInit.mock.calls[0][0];
    expect(config).toMatchObject({
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'production',
      release: '1.2.3',
      tracesSampleRate: 0.5,
      tracePropagationTargets: ['api.hel.fi', 'example.com'],
      profilesSampleRate: 0.25,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0
    });
    expect(config.integrations).toEqual([
      'browserTracingIntegration',
      'browserProfilingIntegration',
      'replayIntegration'
    ]);
    expect(mockBrowserTracingIntegration).toHaveBeenCalledTimes(1);
    expect(mockBrowserProfilingIntegration).toHaveBeenCalledTimes(1);
    expect(mockReplayIntegration).toHaveBeenCalledTimes(1);
  });

  it('defaults sample rates to 0 and propagation targets to [""] when unset', () => {
    process.env.REACT_APP_SENTRY_DSN = 'https://public@example.ingest.sentry.io/1';

    importSentryModule();

    const config = mockInit.mock.calls[0][0];
    expect(config.environment).toBeUndefined();
    expect(config.release).toBeUndefined();
    expect(config.tracesSampleRate).toBe(0);
    expect(config.profilesSampleRate).toBe(0);
    expect(config.replaysSessionSampleRate).toBe(0);
    expect(config.replaysOnErrorSampleRate).toBe(0);
    expect(config.tracePropagationTargets).toEqual(['']);
  });
});

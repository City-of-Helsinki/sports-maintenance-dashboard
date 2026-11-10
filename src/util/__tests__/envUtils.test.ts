import { getEnvValue } from '../envUtils';

describe('getEnvValue', () => {
  afterEach(() => {
    delete window._env_;
  });

  it('prefers runtime values, including empty strings', () => {
    window._env_ = { API_URL: 'runtime', REACT_APP_SENTRY_DSN: '' };

    expect(getEnvValue('API_URL', 'build-time')).toBe('runtime');
    expect(getEnvValue('REACT_APP_SENTRY_DSN', 'build-time')).toBe('');
  });

  it('normalizes primitive runtime values', () => {
    window._env_ = { ENABLED: false, RATE: 0.5 };

    expect(getEnvValue('ENABLED')).toBe('false');
    expect(getEnvValue('RATE')).toBe('0.5');
  });

  it('falls back for absent or invalid runtime values', () => {
    expect(getEnvValue('API_URL', 'fallback')).toBe('fallback');
    window._env_ = { API_URL: null };
    expect(getEnvValue('API_URL', 'fallback')).toBe('fallback');
    expect(getEnvValue('MISSING')).toBeUndefined();
  });
});
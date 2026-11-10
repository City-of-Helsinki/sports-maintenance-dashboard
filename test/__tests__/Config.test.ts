import config from '../../src/config/test';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

interface ViteConfigurationSnapshot {
  api: string;
  dsn: string;
  keys: string[];
  configAlias: string;
  port: number;
}

describe('appEnvConfigTests', () => {
  it('should load the test environment configuration', () => {
    expect(config.appEnv).toBe('test');
  });
});

describe('Vite build configuration', () => {
  it('preserves build-time environment values, aliases, and the development port', () => {
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', `
      import { loadConfigFromFile } from 'vite';
      const { config } = await loadConfigFromFile({ command: 'serve', mode: 'development' });
      console.log(JSON.stringify({
        api: config.define['process.env.API_URL'],
        dsn: config.define['process.env.REACT_APP_SENTRY_DSN'],
        keys: Object.keys(config.define),
        configAlias: config.resolve.alias.config,
        port: config.server.port
      }));
    `], {
      encoding: 'utf8',
      timeout: 30_000,
      env: {
        ...process.env,
        API_URL: 'https://vite-test.example/api',
        REACT_APP_SENTRY_DSN: '',
        PRIVATE_TOKEN: 'not-public',
        REACT_APP_UNLISTED_SECRET: 'not-public'
      }
    });
    const configuration: ViteConfigurationSnapshot = JSON.parse(result);

    expect(configuration.api).toBe('"https://vite-test.example/api"');
    expect(configuration.dsn).toBe('""');
    expect(configuration.keys).not.toContain('process.env.PRIVATE_TOKEN');
    expect(configuration.keys).not.toContain('process.env.REACT_APP_UNLISTED_SECRET');
    expect(configuration.configAlias).toMatch(/\/src\/config\/dev\.js$/);
    expect(configuration.port).toBe(8001);
  }, 35_000);

  it('uses a module entry point without manual bundles or application caching', () => {
    const html = readFileSync('index.html', 'utf8');

    expect(html).toContain('<script type="module" src="/src/index.tsx"></script>');
    expect(html).not.toContain('/assets/');
    expect(html).not.toContain('appcache');
    expect(html).toContain('<script src="/env-config.js"></script>');
    expect(html.indexOf('/env-config.js')).toBeLessThan(html.indexOf('/src/index.tsx'));
  });
});

describe('runtime environment generation', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'dashboard-runtime-'));
    copyFileSync('.env.example', join(directory, '.env.example'));
    copyFileSync('.env.defaults', join(directory, '.env.defaults'));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  function generate(mode = 'production', overrides: Record<string, string> = {}): Record<string, string> {
    const environment = Object.fromEntries(
      Object.entries(process.env)
        .filter(([key]) => key !== 'API_URL' && !key.startsWith('REACT_APP_'))
    );
    execFileSync(process.execPath, [resolve('scripts/update-runtime-env.mts'), '--mode', mode], {
      cwd: directory,
      env: { ...environment, ...overrides },
      timeout: 30_000
    });
    const context = { window: { _env_: {} as Record<string, string> } };
    runInNewContext(readFileSync(join(directory, 'public/env-config.js'), 'utf8'), context);
    return context.window._env_;
  }

  it('uses the existing mode-specific defaults', () => {
    expect(generate()).toMatchObject({
      API_URL: 'https://api.hel.fi/servicemap/v2',
      REACT_APP_SENTRY_ENVIRONMENT: '',
      REACT_APP_SENTRY_DSN: ''
    });
    expect(generate('development').REACT_APP_SENTRY_ENVIRONMENT).toBe('local');
  });

  it('retains example defaults when production defaults omit public keys', () => {
    writeFileSync(join(directory, '.env.defaults'), 'API_URL=https://default.example/api\n');

    const environment = generate();

    expect(environment).toMatchObject({
      API_URL: 'https://default.example/api',
      REACT_APP_SENTRY_ENVIRONMENT: 'local',
      REACT_APP_SENTRY_DSN: ''
    });
    expect(Object.values(environment).every(value => typeof value === 'string')).toBe(true);
    expect(readFileSync(join(directory, '.env.runtime'), 'utf8')).not.toContain('=undefined');
  });

  it('prefers process values over local and mode-specific files, including empty values', () => {
    writeFileSync(join(directory, '.env'), 'API_URL=https://local.example/api\n');
    writeFileSync(join(directory, '.env.production.local'), 'API_URL=https://production.example/api\n');
    expect(generate().API_URL).toBe('https://production.example/api');
    expect(generate('production', {
      API_URL: 'https://process.example/api',
      REACT_APP_SENTRY_DSN: ''
    })).toMatchObject({ API_URL: 'https://process.example/api', REACT_APP_SENTRY_DSN: '' });
    expect(readFileSync(join(directory, '.env.runtime'), 'utf8'))
      .toContain('API_URL="https://process.example/api"');
  });

  it('escapes browser values and excludes unlisted keys', () => {
    const release = 'release "quoted" \\ test\nnext';
    const environment = generate('production', {
      REACT_APP_SENTRY_RELEASE: release,
      PRIVATE_TOKEN: 'not-public',
      REACT_APP_UNLISTED_SECRET: 'not-public'
    });

    expect(environment.REACT_APP_SENTRY_RELEASE).toBe(release);
    expect(environment.PRIVATE_TOKEN).toBeUndefined();
    expect(environment.REACT_APP_UNLISTED_SECRET).toBeUndefined();
  });
});
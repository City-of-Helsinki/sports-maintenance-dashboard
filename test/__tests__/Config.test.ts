import config from '../../src/config/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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
    expect(html).not.toContain('env-config.js');
  });
});
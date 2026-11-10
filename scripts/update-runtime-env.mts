import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, parseEnv } from 'node:util';
import { loadEnv } from 'vite';

export function getPublicEnvironment(mode: string, root: string): Record<string, string> {
  const defaults = parseEnv(readFileSync(resolve(root, '.env.example'), 'utf8'));
  const productionDefaults = resolve(root, '.env.defaults');
  const fallback = mode === 'production' && existsSync(productionDefaults)
    ? { ...defaults, ...parseEnv(readFileSync(productionDefaults, 'utf8')) }
    : defaults;
  const environment = loadEnv(mode, root, '');

  return Object.fromEntries(
    Object.keys(defaults)
      .filter((key) => key === 'API_URL' || /^REACT_APP_[A-Z0-9_]+$/.test(key))
      .map((key) => [key, environment[key] ?? fallback[key]])
  );
}

export function writeRuntimeEnvironment(environment: Record<string, string>, root: string): void {
  mkdirSync(resolve(root, 'public'), { recursive: true });
  writeFileSync(
    resolve(root, 'public/env-config.js'),
    `window._env_ = ${JSON.stringify(environment)};\n`
  );
  writeFileSync(
    resolve(root, '.env.runtime'),
    Object.entries(environment)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('\n') + '\n'
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      mode: { type: 'string', default: process.env.NODE_ENV || 'development' }
    }
  });
  const root = process.cwd();
  writeRuntimeEnvironment(getPublicEnvironment(values.mode, root), root);
}
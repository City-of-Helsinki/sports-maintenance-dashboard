import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const sourcePath = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig(({ command, mode }): UserConfig => {
  const defaultsFile = mode === 'production' ? '.env.defaults' : '.env.example';
  const defaults = parseEnv(readFileSync(new URL(defaultsFile, import.meta.url), 'utf8'));
  const environment = loadEnv(mode, root, '');

  return {
    plugins: react(),
    define: Object.fromEntries(
      Object.entries(defaults)
        .filter(([key]) => key === 'API_URL' || /^REACT_APP_[A-Z0-9_]+$/.test(key))
        .map(([key, fallback]) => [`process.env.${key}`, JSON.stringify(environment[key] ?? fallback)])
    ),
    resolve: {
      alias: {
        actions: sourcePath('actions'),
        components: sourcePath('components'),
        sources: sourcePath('sources'),
        stores: sourcePath('stores'),
        styles: sourcePath('styles'),
        config: sourcePath(`config/${command === 'serve' ? 'dev' : 'dist'}.js`),
        '~bootstrap-sass': fileURLToPath(new URL('./node_modules/bootstrap-sass', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import']
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 8001
    },
    preview: {
      host: '0.0.0.0',
      port: 8001
    },
    build: {
      sourcemap: true
    }
  };
});
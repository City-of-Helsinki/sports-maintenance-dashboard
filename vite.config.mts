import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';
import { getPublicEnvironment, writeRuntimeEnvironment } from './scripts/update-runtime-env.mts';

const root = fileURLToPath(new URL('.', import.meta.url));
const sourcePath = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig(({ command, mode }): UserConfig => {
  const environment = getPublicEnvironment(mode, root);

  return {
    plugins: [
      ...react(),
      {
        name: 'runtime-environment',
        configureServer(server) {
          server.middlewares.use('/env-config.js', (_request, response) => {
            response.setHeader('Content-Type', 'application/javascript');
            response.setHeader('Cache-Control', 'no-store');
            response.end(`window._env_ = ${JSON.stringify(environment)};\n`);
          });
        },
        buildStart() {
          writeRuntimeEnvironment(environment, root);
        }
      }
    ],
    define: Object.fromEntries(
      Object.entries(environment)
        .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
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
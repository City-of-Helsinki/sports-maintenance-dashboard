# Information #

This is a React + Redux app which is used on mobile phones to send
up-to-date status updates of outdoor sporting facilities to a
compatible observations REST API.

# Requirements #

Node.js version 24

# Setup #

Optionally copy `.env.example` to `.env` and edit `API_URL` to point to the
correct API root, or set the `API_URL` environment variable. Development uses
`.env.example` defaults; production uses `.env.defaults`. Vite also loads
mode-specific files such as `.env.production`. Process environment variables
take precedence over files.

Run `pnpm install`

## Error tracking (Sentry) ##

The app reports errors, traces, profiles and (optionally) session replays to
[Sentry](https://city-of-helsinki.sentry.io/). It stays disabled unless `REACT_APP_SENTRY_DSN`
is set, so no configuration is required for local development. To enable it, set these variables
in `.env` or as container environment variables:

- `REACT_APP_SENTRY_DSN` — Sentry project DSN; leave empty to keep Sentry off.
- `REACT_APP_SENTRY_ENVIRONMENT` — e.g. `local`, `review`, `development`, `testing`, `staging`,
  `production`.
- `REACT_APP_SENTRY_RELEASE` — release identifier shown in Sentry.
- `REACT_APP_SENTRY_TRACES_SAMPLE_RATE` / `REACT_APP_SENTRY_PROFILES_SAMPLE_RATE` — `0`-`1`,
  default `0` (off).
- `REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS` — comma-separated list of URLs/hosts to attach
  trace headers to.
- `REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` / `REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`
  — `0`-`1`, default `0` (off).

# Development #

Run `pnpm start`

The Vite development server listens on http://localhost:8001 and supports
React Fast Refresh. It selects the next available port if 8001 is occupied.

| Command | Description |
|---------|-------------|
| `pnpm start` / `pnpm serve` | Start the development server |
| `pnpm build` / `pnpm dist` | Build production assets into `dist` |
| `pnpm serve:dist` | Preview the production build locally |
| `pnpm update-runtime-env --mode production` | Generate public browser configuration manually |
| `pnpm typecheck` | Check application, test, and Vite configuration types |
| `pnpm test` | Run Jest tests and ESLint |

The root `index.html` is the application entry point. Vite generates references
to content-hashed JavaScript, CSS, and font assets. Files in `public` are copied
without renaming. The obsolete application-cache manifest is no longer used.

`API_URL` and the `REACT_APP_*` keys listed in `.env.example` are public browser
settings. Vite generates `public/env-config.js` and `.env.runtime` at startup
and build time using the selected mode. This also works for custom Vite modes.
The browser loads `/env-config.js` before the application, and runtime values
take precedence over the existing build-time fallbacks. Restart the dev server
after changing environment settings. Never put secrets in these keys; unlisted
keys are excluded. Jest continues to use the existing Babel configuration.

## Commit messages ##

`pnpm install` sets up a Husky `commit-msg` hook that validates messages with
commitlint. Use Conventional Commits, for example `fix: correct unit status`.
Scopes are optional. Allowed types are `build`, `chore`, `ci`, `deps`, `docs`,
`feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`.

Keep the header and body lines at most 72 characters long, and separate the
body from the header with a blank line. Commits signed off by `dependabot[bot]`
or `sol-office-file-synchronization[bot]` are ignored.

## Development with Docker ##

Build and start the development container with:

```sh
docker compose up --build
```

Open http://localhost:8001 in your browser. Stop the container with `Ctrl+C`,
or run `docker compose down` from another terminal.

Configure the development API and Sentry settings in the bind-mounted `.env`
file or as Compose environment variables. Without overrides, Vite uses the
defaults from `.env.example`.

## Production with Docker ##

The Dockerfile uses the shared Helsinki Node.js builder and Nginx SPA images.
Build once and supply public settings when starting the container:

```sh
docker build --target production -t sports-maintenance-dashboard .
docker run --rm --env-file .env -p 8080:8080 sports-maintenance-dashboard
```

Open http://localhost:8080. Image defaults come from `.env.example` and
`.env.defaults`; Docker configuration build arguments are not used. The shared
Nginx entrypoint regenerates `/env-config.js` at container startup, using
environment variables over those defaults. The application runs
as a non-root user and provides `/healthz` and versioned `/readiness` endpoints.
Runtime configuration is served without caching; content-hashed assets retain
the shared image's immutable caching.

Set `REACT_APP_SENTRY_RELEASE` at runtime for browser error tracking and
`APP_RELEASE` for the release reported by `/readiness`. An optional
`docker build --build-arg REACT_APP_SENTRY_RELEASE=<commit-sha> ...` sets the
image's default `APP_RELEASE`; a runtime `APP_RELEASE` overrides it. This
metadata argument does not configure the browser's Sentry release. The base
image reads the application version from `package.json`.

Deployments that currently pass API or Sentry settings as Docker build
arguments must move them to runtime environment variables or ConfigMaps.
Shared Azure pipeline settings are maintained in `ulkoliikuntakartta-pipelines`;
the commented examples in this repository show the runtime configuration.

Only keys listed in `.env.example` are injected. The shared startup helper
treats empty environment variables as missing and falls back to image defaults;
leave the DSN empty in image defaults when Sentry must remain disabled. The
browser lookup itself preserves explicitly empty runtime values.

## TypeScript Support ##

This project supports incremental TypeScript migration alongside JavaScript. You can create new components as `.tsx` files or gradually convert existing `.js` files to TypeScript.

### Type Checking ###

Run `pnpm typecheck` to check TypeScript types without emitting files.

### File Extensions ###

- Use `.tsx` for React components with TypeScript
- Use `.ts` for utility files, actions, reducers with TypeScript  
- Existing `.js` and `.jsx` files continue to work unchanged

### Migration Strategy ###

1. Start with simple components that have no props
2. Convert components that already have PropTypes defined
3. Add type definitions for Redux state and actions
4. Gradually convert remaining components

The build system automatically handles both JavaScript and TypeScript files.

# Production build #

1. Run `pnpm typecheck` and `pnpm test`.
2. Run `pnpm build`.
3. Deploy the contents of `dist` as static files, with SPA routes falling back
  to `index.html`. Cache hashed assets long-term, but revalidate `index.html`.

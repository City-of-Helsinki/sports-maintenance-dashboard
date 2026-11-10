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
in `.env` (or as build args, see `Dockerfile`):

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
| `pnpm typecheck` | Check application, test, and Vite configuration types |
| `pnpm test` | Run Jest tests and ESLint |

The root `index.html` is the application entry point. Vite generates references
to content-hashed JavaScript, CSS, and font assets. Files in `public` are copied
without renaming. The obsolete application-cache manifest is no longer used.

`API_URL` and the `REACT_APP_*` keys in the defaults files are public build-time
settings. Existing variable names and Docker build arguments remain supported;
no runtime environment injection is included. Never put secrets in these keys.
Jest continues to use the existing Babel configuration.

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

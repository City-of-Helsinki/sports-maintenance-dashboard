# Information #

This is a React + Redux app which is used on mobile phones to send
up-to-date status updates of outdoor sporting facilities to a
compatible observations REST API.

# Requirements #

Node.js version 22

# Setup #

Copy .env.example to .env and edit the API_URL variable to
point to the correct API root or use the API_URL environment variable.

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
  — `0`-`1`, default `0` (off). **Keep these at `0`**: per the org's Sentry policy, Session Replay
  must stay disabled (this policy may be reviewed in the future).

# Development #

Run `pnpm start`

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

1. Important! Update the version in `src/pulkka.appcache`
2. Run `pnpm build`.
3. Deploy the contents of the dist folder as static files.

# Information #

This is a React + Redux app which is used on mobile phones to send
up-to-date status updates of outdoor sporting facilities to a
compatible observations REST API.

# Requirements #

Node.js version 18

# Setup #

Copy .env.example to .env and edit the API_URL variable to
point to the correct API root or use the API_URL environment variable.

Run `npm install`

# Development #

Run `npm start`

## TypeScript Support ##

This project supports incremental TypeScript migration alongside JavaScript. You can create new components as `.tsx` files or gradually convert existing `.js` files to TypeScript.

### Type Checking ###

Run `npm run typecheck` to check TypeScript types without emitting files.

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
2. Run `npm run build`.
3. Deploy the contents of the dist folder as static files.

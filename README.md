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

# Production build #

1. Important! Update the version in `src/pulkka.appcache`
2. Run `npm run build`.
3. Deploy the contents of the dist folder as static files.

# =======================================================
FROM node:18.12.1-bullseye-slim AS appbase
# =======================================================

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends bzip2

COPY package.json .

RUN npm install

# =======================================================
FROM appbase AS development
# =======================================================

ARG API_URL=https://palvelukartta-api-test.agw.arodevtest.hel.fi/v2
ENV API_URL $API_URL

COPY . .

EXPOSE 8001

CMD ["npm", "start"]

# =======================================================
FROM appbase AS staticbuilder
# =======================================================

ARG API_URL=https://api.hel.fi/servicemap/v2
ENV API_URL $API_URL

COPY . .

RUN npm install -D webpack-cli && npm run dist

# =======================================================
FROM nginx:1.22.1-alpine AS production
# =======================================================

COPY --from=staticbuilder --chown=nginx:nginx /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

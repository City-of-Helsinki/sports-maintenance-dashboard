# =======================================================
FROM helsinki.azurecr.io/ubi9/nodejs-24-pnpm-builder-base AS appbase
# =======================================================

WORKDIR /app

COPY --chown=default:root package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm store prune

# =======================================================
FROM appbase AS development
# =======================================================

COPY --chown=default:root . .

EXPOSE 8001

CMD ["pnpm", "start"]

# =======================================================
FROM appbase AS staticbuilder
# =======================================================

COPY --chown=default:root . .

RUN pnpm dist

# =======================================================
FROM helsinki.azurecr.io/ubi9/nginx-126-spa-standard AS production
# =======================================================

ARG REACT_APP_SENTRY_RELEASE
ENV APP_RELEASE=${REACT_APP_SENTRY_RELEASE:-""}

# 1. Copy the compiled assets
COPY --from=staticbuilder --chown=1001:0 /app/dist /usr/share/nginx/html

# 2. Setup Runtime Env Injection
WORKDIR /usr/share/nginx/html
COPY --from=staticbuilder --chown=1001:0 /app/.env.runtime .env

# 3. Inject Versioning for the /readiness endpoint from package.json using base image
COPY package.json .

# - env.sh      (Inherited from base image at /usr/share/nginx/html/env.sh)
# - USER 1001   (Inherited from base image)
# - EXPOSE 8080 (Inherited from base image)
# - ENTRYPOINT/CMD (Inherited from base image)

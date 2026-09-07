# =======================================================
FROM registry.access.redhat.com/ubi9/nodejs-24 AS appbase
# =======================================================

USER root

WORKDIR /app

RUN yum update -y && yum install -y bzip2 && yum clean all

RUN npm install --global pnpm@11.22.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# =======================================================
FROM appbase AS development
# =======================================================

ARG API_URL=https://palvelukartta.api.test.hel.ninja/v2
ENV API_URL=$API_URL

# Cloud Sentry (https://city-of-helsinki.sentry.io/); disabled unless DSN is set
ARG REACT_APP_SENTRY_DSN=
ENV REACT_APP_SENTRY_DSN=$REACT_APP_SENTRY_DSN
ARG REACT_APP_SENTRY_ENVIRONMENT=local
ENV REACT_APP_SENTRY_ENVIRONMENT=$REACT_APP_SENTRY_ENVIRONMENT
ARG REACT_APP_SENTRY_RELEASE=
ENV REACT_APP_SENTRY_RELEASE=$REACT_APP_SENTRY_RELEASE
ARG REACT_APP_SENTRY_TRACES_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_TRACES_SAMPLE_RATE=$REACT_APP_SENTRY_TRACES_SAMPLE_RATE
ARG REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS=
ENV REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS=$REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS
ARG REACT_APP_SENTRY_PROFILES_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_PROFILES_SAMPLE_RATE=$REACT_APP_SENTRY_PROFILES_SAMPLE_RATE
ARG REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=$REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
ARG REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=$REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE

COPY . .

EXPOSE 8001

CMD ["pnpm", "start"]

# =======================================================
FROM appbase AS staticbuilder
# =======================================================

ARG API_URL=https://api.hel.fi/servicemap/v2
ENV API_URL=$API_URL

# Cloud Sentry (https://city-of-helsinki.sentry.io/); disabled unless DSN is set
ARG REACT_APP_SENTRY_DSN=
ENV REACT_APP_SENTRY_DSN=$REACT_APP_SENTRY_DSN
ARG REACT_APP_SENTRY_ENVIRONMENT=
ENV REACT_APP_SENTRY_ENVIRONMENT=$REACT_APP_SENTRY_ENVIRONMENT
ARG REACT_APP_SENTRY_RELEASE=
ENV REACT_APP_SENTRY_RELEASE=$REACT_APP_SENTRY_RELEASE
ARG REACT_APP_SENTRY_TRACES_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_TRACES_SAMPLE_RATE=$REACT_APP_SENTRY_TRACES_SAMPLE_RATE
ARG REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS=
ENV REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS=$REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS
ARG REACT_APP_SENTRY_PROFILES_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_PROFILES_SAMPLE_RATE=$REACT_APP_SENTRY_PROFILES_SAMPLE_RATE
ARG REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=$REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
ARG REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0
ENV REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=$REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE

COPY --chown=root:root . .

RUN pnpm dist

# =======================================================
FROM registry.access.redhat.com/ubi10/nginx-126 AS production
# =======================================================
# Add application sources to a directory that the assemble script expects them
# and set permissions so that the container runs without root access
USER root

RUN chgrp -R 0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html

COPY --from=staticbuilder /app/dist /usr/share/nginx/html

COPY nginx.conf /opt/app-root/etc/nginx.default.d/default.conf

USER 1001

EXPOSE 8080

# Run script uses standard ways to run the application
CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]

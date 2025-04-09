# =======================================================
FROM registry.access.redhat.com/ubi9/nodejs-22 AS appbase
# =======================================================

USER root

WORKDIR /app

RUN yum update -y && yum install -y bzip2 && yum clean all

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

COPY --chown=root:root . .

RUN npm install -D webpack-cli && npm run dist

# =======================================================
FROM registry.access.redhat.com/ubi9/nginx-122 AS production
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

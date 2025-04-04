# =======================================================
FROM registry.access.redhat.com/ubi9/nodejs-22 AS appbase
# =======================================================

USER root

WORKDIR /app

COPY --chown=root:root --chmod=755 . /app/

RUN yum update -y && yum install -y bzip2 && yum clean all

RUN chown -R default:root /app

USER default

COPY package.json .

RUN npm install

# =======================================================
FROM appbase AS development
# =======================================================

ARG API_URL=https://palvelukartta-api-test.agw.arodevtest.hel.fi/v2
ENV API_URL $API_URL

COPY --chown=default:root . .

EXPOSE 8001

CMD ["npm", "start"]

# =======================================================
FROM appbase AS staticbuilder
# =======================================================

ARG API_URL=https://api.hel.fi/servicemap/v2
ENV API_URL $API_URL

USER root

COPY . .

RUN chown -R default:root /app

USER default

RUN npm install -D webpack-cli && npm run dist

# =======================================================
FROM registry.access.redhat.com/ubi9/nginx-122 AS production
# =======================================================

COPY --from=staticbuilder --chown=nginx:nginx /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

FROM buildkite/puppeteer:v1.15.0 AS base
WORKDIR /app

RUN apt-get update \
     && apt-get install -y git --no-install-recommends

COPY src/package.json src/package-lock.json src/bower.json src/.bowerrc ./

# dependencies

FROM base AS dependencies
WORKDIR /app

RUN npm set progress=false && \
    npm config set depth 0

RUN npm ci && \
    npx bower --allow-root install

# build

FROM dependencies AS build
WORKDIR /app

ARG UI_VERSION=2.0.0-dev
ENV UI_VERSION=$UI_VERSION

COPY src/. .

USER root
RUN npx grunt build

# testrunner

FROM build AS testrunner
WORKDIR /app

ENTRYPOINT [ "npx", "grunt", "test" ]

# ui

FROM nginx:stable as ui
WORKDIR /app
COPY --from=build /app/dist ./
COPY bootstrap.sh /usr/local/bin/bootstrap
COPY nginx-site.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /usr/local/bin/bootstrap && \
  echo "daemon off;" >> /etc/nginx/nginx.conf

ENTRYPOINT [ "bootstrap" ]

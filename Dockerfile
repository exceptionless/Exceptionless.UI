FROM node:12.4.0 as base

# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -yq google-chrome-stable

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

#dependencies
FROM base AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm set progress=false && \
    npm config set depth 0

RUN npm ci
RUN npm install -g @angular/cli@8.0.4

#build
FROM dependencies AS build
WORKDIR /app

ARG UI_VERSION=3.0.0-dev
ENV UI_VERSION=$UI_VERSION

COPY . /app

RUN sed -i 's/@@version/%UI_VERSION%/g' /app/src/app/exceptionless-client.ts
RUN sed -i 's/@@version/%UI_VERSION%/g' /app/src/app/components/layout/layout.component.ts

USER root
RUN ng build --prod --output-path=dist

#testrunner
FROM build AS testrunner
WORKDIR /app

RUN ng test --watch=false
RUN ng e2e --port 4202

#ui
FROM nginx:stable as ui
WORKDIR /app

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-site.conf /etc/nginx/conf.d/default.conf

COPY bootstrap /usr/local/bin/bootstrap
RUN chmod +x /usr/local/bin/bootstrap && \
  echo "daemon off;" >> /etc/nginx/nginx.conf

ENTRYPOINT [ "bootstrap" ]

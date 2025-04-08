FROM harbor.tce.rn.gov.br/docker/node:14.21 AS builder

WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app
USER node
COPY package.json package-lock.json ./
ARG VERDACCIO_URL=https://verdaccio.tce.rn.gov.br
RUN echo "registry=${VERDACCIO_URL}" > .npmrc && \
    npm i --force

COPY . .
RUN npm run build-prd

FROM harbor.tce.rn.gov.br/docker/alpine/curl:8.7.1 as agent

ARG version 1.0.4

RUN mkdir /opt/opentelemetry
WORKDIR /opt/opentelemetry

RUN mkdir agent
RUN wget -c https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv1.0.4/opentelemetry-webserver-sdk-x64-linux.tgz
RUN unzip -p opentelemetry-webserver-sdk-x64-linux.tgz | tar -zx -C agent

FROM harbor.tce.rn.gov.br/docker/nginx:1.27-alpine

RUN apk add --no-cache libstdc++

ARG ARCH="x86_64"

RUN ALPINE_VERSION=$(cat /etc/alpine-release | cut -d. -f1-2 | sed 's/^/v/') && \
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d/ -f2) && \
    MODULE_URL_BASE=https://nginx.org/packages/alpine/$ALPINE_VERSION/main/${ARCH}/ && \
    wget -qO- $MODULE_URL_BASE | \
    grep -o 'nginx-module-otel-[0-9\.]*-r[0-9]*\.apk' | \
    sort -Vr | \
    head -n 1 | \
    xargs -I {} wget ${MODULE_URL_BASE}{} && \
    tar -xzf ./nginx-module-otel-*.apk && \
    rm nginx-module-otel-*.apk

COPY --from=agent /opt/opentelemetry/agent/opentelemetry-webserver-sdk /opt/opentelemetry

RUN chmod 775 -R /opt/opentelemetry/
RUN chmod a+w /opt/opentelemetry/logs

# Copia os arquivos gerados na etapa anterior para o NGINX
COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html

# Configura o healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
# Build context is the repository root; Dockerfile.dockerignore next to this file allow-lists what enters it.

# Build stage: same Node as .nvmrc, installed only from the lock file.
FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS build
WORKDIR /app
# Caps the heap of tsc and vite so the build fits in the shared VM.
ENV NODE_OPTIONS=--max-old-space-size=1024
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json tsconfig.test.json vite.config.ts vitest.config.ts ./
COPY src ./src
COPY tests ./tests
RUN npm run build

# Runtime stage: unprivileged nginx with the static build only; no secrets or URLs are baked in.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine3.24-slim@sha256:5d8bb9437d74a600ec5dbf90c035451c724dc33eac8d3a71078f6f8612c345f6
USER root
# Only the portal is served: the default site and the sample pages of the base image are removed.
RUN rm -f /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html && mkdir -p /usr/share/nginx/html
COPY --chmod=0755 deploy/portal-web/05-require-files-origin.sh /docker-entrypoint.d/05-require-files-origin.sh
COPY --chmod=0755 deploy/portal-web/25-require-rendered-config.sh /docker-entrypoint.d/25-require-rendered-config.sh
COPY deploy/portal-web/templates/ /etc/nginx/templates/
COPY --from=build /app/dist/ /usr/share/nginx/html/
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

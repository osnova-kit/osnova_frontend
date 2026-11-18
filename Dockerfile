FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BASE_URL=/api/v1
ARG VITE_SITE_URL=
ARG VITE_OG_IMAGE=
ARG VITE_LANGUAGES=
ARG VITE_DEFAULT_LANGUAGE=
ARG VITE_APP_NAME=
ARG PRERENDER_API_URL=
ARG VITE_ANALYTICS_SCRIPT=
ARG CSP_EXTRA_ORIGINS=
ARG VITE_SENTRY_DSN=
ARG VITE_SENTRY_ENVIRONMENT=
ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_OG_IMAGE=$VITE_OG_IMAGE \
    VITE_LANGUAGES=$VITE_LANGUAGES \
    VITE_DEFAULT_LANGUAGE=$VITE_DEFAULT_LANGUAGE \
    VITE_APP_NAME=$VITE_APP_NAME \
    PRERENDER_API_URL=$PRERENDER_API_URL \
    VITE_ANALYTICS_SCRIPT=$VITE_ANALYTICS_SCRIPT \
    CSP_EXTRA_ORIGINS=$CSP_EXTRA_ORIGINS \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT
RUN npm run build && node scripts/security-headers.mjs > security-headers.conf

FROM nginx:1.31-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]

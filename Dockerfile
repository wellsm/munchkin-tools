# syntax=docker/dockerfile:1.7

# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching on source-only changes)
COPY package.json package-lock.json ./
RUN npm ci

# Build the SPA (tsc -b && vite build → dist/)
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime

# Replace default config with SPA-aware one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]

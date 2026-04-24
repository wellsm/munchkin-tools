# syntax=docker/dockerfile:1.7
#
# Build context is the REPO ROOT (monorepo-aware), not this folder.
# Build from repo root with:
#   docker build -f apps/web/Dockerfile -t munchkin-tools .

# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Required at build time: Vite inlines import.meta.env.VITE_* values into
# the bundle during `npm run build`, so the Convex URL must be available
# during the build step — runtime env vars cannot reach the client bundle.
ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

# Copy workspace manifests first for better caching
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/convex/package.json ./packages/convex/

# Install all workspace deps (npm workspaces hoists to root node_modules)
RUN npm ci

# Copy everything else and build the web app
COPY . .
RUN npm run build --workspace=@munchkin-tools/web

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]

# Use a minimal Node.js Alpine base
FROM node:lts-alpine AS base

# Dependencies Layer
FROM base AS frontend-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --only=production --no-audit --no-fund

# Build Layer
FROM base AS frontend-builder
WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY . . 

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=$API_URL
ENV NEXT_PUBLIC_TYPST_COMPILER_URL=/typst-compiler.wasm
ENV NEXT_PUBLIC_TYPST_RENDERER_URL=/typst-renderer.wasm
ENV NEXT_TELEMETRY_DISABLED=1


RUN npm run build

# Final Runner Stage (Minimal Size)
FROM base AS runner
WORKDIR /app

# Copy only necessary files to avoid rebuilds
# COPY --from=frontend-builder /app/.next ./.next
# COPY --from=frontend-builder /app/public ./public
# COPY --from=frontend-builder /app/package.json ./package.json

COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder  /app/.next/standalone ./
COPY --from=frontend-builder  /app/.next/static ./.next/static

# RUN npm i next@15.2
# COPY --from=frontend-deps /app/node_modules ./node_modules

# Ensure we don't rebuild on start
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "server.js"]

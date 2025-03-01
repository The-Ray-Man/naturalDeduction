
FROM node:lts-alpine3.19 AS frontend

FROM frontend AS frontend-deps

WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci -f

FROM frontend AS frontend-builder

WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_API_URL=$API_URL
ENV NEXT_PUBLIC_TYPST_COMPILER_URL=/typst-compiler.wasm
ENV NEXT_PUBLIC_TYPST_RENDERER_URL=/typst-renderer.wasm

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

# 8. Copy the built application from the builder stage
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json /app/package-lock.json ./

RUN npm install --only=production --force
# 9. Expose the port Next.js runs on
EXPOSE 3000

# 10. Run the Next.js application
CMD ["npm", "run", "start"]

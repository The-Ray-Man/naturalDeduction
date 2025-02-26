FROM rust:alpine3.19 AS api-builder

WORKDIR /app
RUN apk add --no-cache musl-dev z3 cmake g++ make python3 curl clang16-libclang z3-dev

COPY backend .
ENV RUSTFLAGS='-C target-feature=-crt-static'
RUN cargo build --release --features static

FROM node:lts-alpine3.19 AS frontend

FROM frontend AS frontend-deps

WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci -f

FROM frontend AS frontend-builder

WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY frontend .

ENV NEXT_PUBLIC_API_URL=/
ENV NEXT_PUBLIC_TYPST_COMPILER_URL=/typst-compiler.wasm
ENV NEXT_PUBLIC_TYPST_RENDERER_URL=/typst-renderer.wasm

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM alpine:3.19 AS runner

WORKDIR /app
COPY --from=api-builder /app/target/release/naturalDeduction ./server
COPY --from=frontend-builder /app/out ./static
COPY --from=frontend-builder /app/node_modules/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm ./static/typst-renderer.wasm
COPY --from=frontend-builder /app/node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm ./static/typst-compiler.wasm

RUN apk add --no-cache z3 z3-dev


EXPOSE 8000

CMD [ "./server" ]

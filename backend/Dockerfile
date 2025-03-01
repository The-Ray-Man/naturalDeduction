FROM rust:alpine3.19 AS api-builder

WORKDIR /app
RUN apk add --no-cache musl-dev z3 cmake g++ make python3 curl clang16-libclang z3-dev

COPY . .
ENV RUSTFLAGS='-C target-feature=-crt-static'
# RUN cargo build --release --features static
RUN cargo build --release


FROM alpine:3.19 AS backend

WORKDIR /app
COPY --from=api-builder /app/target/release/naturalDeduction ./server
RUN apk add --no-cache z3 z3-dev

EXPOSE 8000

CMD [ "./server" ]

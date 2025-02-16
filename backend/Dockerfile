FROM ubuntu:latest
WORKDIR /usr/src/app
RUN apt-get update

# Get Ubuntu packages
RUN apt-get install -y \
    build-essential \
    curl

# Update new packages
RUN apt-get update

RUN apt install pkg-config -y
RUN apt install libssl-dev -y
RUN apt install libudev-dev -y
RUN apt install clang  -y


# Get Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

# RUN cargo build --release
# CMD ["rustc", "--version"]
CMD ["cargo", "run", "--release"]
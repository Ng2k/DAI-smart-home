# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.5-debian AS base
WORKDIR /usr/src/app

# -------------------------
# Install dependencies
# -------------------------
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# -------------------------
# Build stage
# -------------------------
FROM base AS build
WORKDIR /usr/src/app

COPY . .
COPY --from=install /usr/src/app/node_modules node_modules

# build TS -> JS (resolves @/* aliases)
RUN bun run build

# -------------------------
# Production image
# -------------------------
FROM oven/bun:1.3.5-debian AS release
WORKDIR /usr/src/app

# only production deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# copy compiled output
COPY --from=build /usr/src/app .

USER bun
ENTRYPOINT ["bun", "run", "dist/index.js"]

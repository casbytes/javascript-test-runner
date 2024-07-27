# base node image
FROM node:20-bookworm-slim AS base

ENV NODE_ENV=production

# install git
RUN apt-get update && apt-get install -y git
RUN npm install -g vitest @eslint/js globals typescript-eslint

# install all node_modules, including dev
FROM base as deps

RUN mkdir /app/
WORKDIR /app/

ADD package.json package-lock.json ./
RUN npm install

# setup production node_modules
FROM base as production-deps

RUN mkdir /app/
WORKDIR /app/

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --omit=dev

# build app
FROM base as build

RUN mkdir /app/
WORKDIR /app/

COPY --from=deps /app/node_modules /app/node_modules

# app code changes all the time
ADD . .
RUN npm run build

# build smaller image for running
FROM base

# ENV DATABASE_URL="file:/app/data/sqlite.db"
ENV PORT="8080"
ENV NODE_ENV="production"

RUN mkdir /app/
WORKDIR /app/

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

ADD . .

CMD ["npm", "start"]
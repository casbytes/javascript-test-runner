# base node image
FROM node:20-bookworm-slim AS base

ENV NODE_ENV=production


# install openssl and sqlite3 for prisma
RUN apt-get update && apt-get install -y git

# install all node_modules, including dev
FROM base as deps

WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --include=dev

# setup production node_modules
FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

# build app
FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

# app code changes all the time
ADD . .
RUN npm run build

# build smaller image for running
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

ADD . .

WORKDIR /app/__testspace__
RUN npm install --include=dev

WORKDIR /app

CMD ["npm", "start"]
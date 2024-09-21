FROM node:20-bookworm-slim AS base

ENV NODE_ENV=production

# RUN apt-get update && apt-get install -y docker

FROM base as deps

WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --include=dev

FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

ADD . .
RUN npm run build

FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

COPY ./scripts/build-images.js ./scripts/build-images.js
ADD . . 
# RUN systemctl enable docker
CMD ["node", "./scripts/build-images.js"]
FROM node:20-bookworm-slim AS base

RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

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

COPY . .
RUN npm run build

FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

COPY . .

RUN chmod +x ./scripts/build_images

CMD ["./scripts/build_images"]
# CMD [ "npm", "start" ]

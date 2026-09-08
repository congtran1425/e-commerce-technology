# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN npm ci

FROM dependencies AS build
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
COPY apps/api apps/api
RUN npm run build --workspace=@ecommerce/api

FROM dependencies AS migrate
COPY apps/api apps/api
CMD ["npm", "run", "db:migrate:deploy", "--workspace=@ecommerce/api"]

FROM base AS production-dependencies
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN npm ci --omit=dev --omit=peer --workspace=@ecommerce/api --include-workspace-root \
  && npm prune --omit=dev --omit=peer --workspace=@ecommerce/api --include-workspace-root \
  && rm -rf node_modules/prisma node_modules/@prisma/config node_modules/deepmerge-ts node_modules/mysql2 \
  && node -e "const childProcess = require('node:child_process'); const fs = require('node:fs'); const path = require('node:path'); let output; const options = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }; try { output = childProcess.execFileSync('npm', ['ls', '--omit=dev', '--depth=0', '--json'], options); } catch (error) { output = error.stdout; } const tree = JSON.parse(output); for (const [name, metadata] of Object.entries(tree.dependencies ?? {})) { if (metadata.extraneous) fs.rmSync(path.join('node_modules', ...name.split('/')), { recursive: true, force: true }); }" \
  && rm -rf node_modules/.bin \
  && npm cache clean --force

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY package.json ./package.json
COPY apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/dist apps/api/dist
USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]

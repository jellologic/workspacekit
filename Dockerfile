FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock turbo.json ./
COPY scripts/ scripts/
COPY packages/types/package.json packages/types/
COPY packages/k8s/package.json packages/k8s/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
RUN bun install --frozen-lockfile

# Build all packages
FROM base AS build
COPY --from=install /app/node_modules node_modules
COPY --from=install /app/packages/types/node_modules packages/types/node_modules
COPY --from=install /app/packages/k8s/node_modules packages/k8s/node_modules
COPY --from=install /app/packages/ui/node_modules packages/ui/node_modules
COPY --from=install /app/apps/web/node_modules apps/web/node_modules
COPY --from=install /app/apps/worker/node_modules apps/worker/node_modules
COPY . .
RUN bun run build

# Production runtime
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.output .output
COPY --from=build /app/apps/worker/dist worker
COPY --from=build /app/node_modules node_modules
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]

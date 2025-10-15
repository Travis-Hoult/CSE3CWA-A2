# dockerfile
# -----------------------------------------------------------------------------
# Provenance & Academic Integrity Notes
# - Source pattern: Multi-stage Next.js container (build → runtime) as shown in
#   lectures: compile in one stage, copy artifacts into a slim runtime.
# - Reuse:
#   • Alpine + build toolchain (python3, make, g++, pkgconf) to compile native
#     deps (e.g., sqlite3 bindings) only in the build stage.
#   • Non-root user in runtime for security (least privilege).
#   • Copies only the built .next, public, node_modules, app, lib, models.
# - AI Assist: Added comments for clarity and ordering rationale. No changes to
#   commands or behavior.
# - External references: Official Next.js containerization guidance and Node
#   images on Docker Hub; best practices (multi-stage, non-root, EXPOSE/PORT).
# -----------------------------------------------------------------------------

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Toolchain for building native modules (sqlite3, sharp, etc.)
RUN apk add --no-cache python3 make g++ pkgconf

# Install deps with a clean lockfile install
COPY package*.json ./
RUN npm ci

# Bring in source and build a production bundle
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Drop privileges (security hardening)
RUN addgroup -S app && adduser -S app -G app

# Copy only what the runtime needs
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/lib ./lib
COPY --from=build /app/models ./models
COPY --from=build /app/app ./app
# If you *do* have a next.config.js, keep this line; otherwise delete it.
# COPY --from=build /app/next.config.js ./  # destination is a dir, ends with /

# Runtime configuration
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Run as non-root
USER app

# Start Next.js production server
CMD ["npm", "start"]
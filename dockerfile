# ---- deps (build native modules like sqlite3 here) ----
FROM node:20-alpine AS deps
WORKDIR /app
# Build tools for native deps (sqlite3)
RUN apk add --no-cache python3 make g++ pkgconf
COPY package*.json ./
# Install all deps incl dev for the build
RUN npm ci

# ---- build (create the Next.js production build) ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- runtime (slim image to run the app) ----
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules built on Alpine (has sqlite3 native binding),
# and the built app artifacts
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next        ./.next
COPY --from=build /app/public       ./public

EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
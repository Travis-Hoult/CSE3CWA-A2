# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# native deps for sqlite bindings etc.
RUN apk add --no-cache python3 make g++ pkgconf

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

# non-root user
RUN addgroup -S app && adduser -S app -G app

# copy built app + runtime bits
COPY --from=build /app/package*.json ./                
COPY --from=build /app/.next ./.next                   
COPY --from=build /app/public ./public                 
COPY --from=build /app/node_modules ./node_modules     
COPY --from=build /app/lib ./lib                       
COPY --from=build /app/models ./models                 
COPY --from=build /app/app ./app                       
# If you *do* have a next.config.js, keep this line; otherwise delete it.
# COPY --from=build /app/next.config.js ./             # destination is a dir, ends with /

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER app
CMD ["npm", "start"]
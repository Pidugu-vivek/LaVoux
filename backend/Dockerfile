# Backend Dockerfile
FROM node:20-bullseye-slim AS base

WORKDIR /app

# Install deps separately for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

CMD ["node", "server.js"]

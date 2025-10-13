# Frontend Dockerfile (Vite + React)
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build

# Run with vite preview (static server)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./

ENV PORT=5173
EXPOSE 5173

# vite preview needs dev deps; install minimal
RUN npm i --omit=prod && npm i vite@^5 --no-audit --no-fund
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]

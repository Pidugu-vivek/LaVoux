# ---------- Stage 1: Build ----------
    FROM node:20-alpine AS build

    WORKDIR /app
    
    # Install dependencies (cached layer)
    COPY package*.json ./
    RUN npm ci
    
    # Copy all source code and build
    COPY . .
    RUN npm run build
    
    
    # ---------- Stage 2: Production (Serve static files) ----------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    # Copy built files from the build stage
    COPY --from=build /app/dist ./dist
    
    # Install only vite (for preview) — optional, better to use a static server
    RUN npm install -g vite@^5
    
    # Set environment variables
    ENV PORT=5173
    EXPOSE 5173
    
    # Start server
    CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
    
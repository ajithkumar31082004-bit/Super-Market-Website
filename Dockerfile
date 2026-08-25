# ====================================================
# Stage 1: Build Dependencies
# ====================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy root and backend package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install only production dependencies cleanly using package-lock.json
RUN npm ci --prefix backend --omit=dev

# ====================================================
# Stage 2: Production Runtime
# ====================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Upgrade OS packages to apply security patches and remove unused package managers (npm, yarn) from runtime image
RUN apk upgrade --no-cache && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /opt/yarn*

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests with non-root user ownership
COPY --chown=node:node package*.json ./
COPY --chown=node:node backend/package*.json ./backend/

# Copy installed production node_modules from dependencies stage
COPY --chown=node:node --from=dependencies /app/backend/node_modules ./backend/node_modules

# Copy full application source code (frontend static assets + backend logic)
COPY --chown=node:node . .

# Switch to unprivileged user for security
USER node

# Expose application port
EXPOSE 5000

# Health check probe against Express /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start the Node.js server directly as PID 1 to ensure proper POSIX signal handling (graceful shutdown)
CMD ["node", "backend/server.js"]


# Use official lightweight Node.js LTS image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy root and backend package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies
RUN npm install --prefix backend --only=production

# Copy application source code (frontend static files + backend logic)
COPY . .

# Expose backend application port
EXPOSE 5000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]

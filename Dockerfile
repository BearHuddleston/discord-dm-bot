FROM node:18-alpine

# Install dependencies for voice support and SQLite
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    ffmpeg

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directories for data and logs
RUN mkdir -p /app/data /app/logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node src/healthcheck.js || exit 1

# Expose port for potential web dashboard
EXPOSE 3000

# Start the bot
CMD ["node", "src/index.js"]
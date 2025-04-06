
# BLACKSKY-MD Premium WhatsApp Bot Container Configuration
FROM node:lts-alpine3.18

# Set working directory
WORKDIR /app

# Create required directories
RUN mkdir -p ./logs ./tmp ./sessions ./sessions-backup ./media

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy remaining files
COPY . .

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=4096 --expose-gc" \
    NODE_EXPOSE_GC=true \
    ENABLE_SESSION_BACKUP=true \
    ENABLE_HEALTH_CHECK=true \
    ENABLE_MEMORY_OPTIMIZATION=true \
    HEALTH_CHECK_PORT=28111

# Expose ports
EXPOSE 28111
EXPOSE 4000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:28111/health || exit 1

# Set entry point
CMD ["node", "heroku-combined-runner.js", "--optimize-memory", "--auto-reconnect", "--performance-mode"]

# BLACKSKY-MD Premium WhatsApp Bot Container Configuration
# Optimized for Heroku deployment with enhanced stability and 24/7 connection

# Use official Node.js LTS Alpine for smaller image size
FROM node:lts-alpine3.18

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Create required directories
RUN mkdir -p ./logs ./tmp ./sessions ./sessions-backup ./media

# Set environment variables for better performance and stability
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size --expose-gc" \
    NODE_EXPOSE_GC=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NO_UPDATE_NOTIFIER=1 \
    HEROKU=true \
    ENABLE_SESSION_BACKUP=true \
    ENABLE_HEALTH_CHECK=true \
    ENABLE_MEMORY_OPTIMIZATION=true \
    HEALTH_CHECK_PORT=28111

# Expose the ports
EXPOSE 5000
EXPOSE 28111

# Add healthcheck
HEALTHCHECK --interval=60s --timeout=20s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || curl -f http://localhost:28111/health || exit 1

# Add volume for persistent data
VOLUME ["/app/sessions", "/app/logs", "/app/database.json", "/app/sessions-backup"]

# Set entry point using our combined runner for enhanced stability
CMD ["node", "heroku-combined-runner.js", "--autocleartmp", "--autoread", "--keepalive"]

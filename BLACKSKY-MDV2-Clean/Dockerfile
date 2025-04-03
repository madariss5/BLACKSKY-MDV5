# BLACKSKY-MD Premium WhatsApp Bot Container Configuration
# Optimized for Heroku deployment with enhanced stability and monitoring

# Use official Node.js LTS Alpine for smaller image size
FROM node:lts-alpine3.18

# Install required dependencies and cleanup in a single layer to reduce image size
RUN apk update && apk add --no-cache \
    ffmpeg \
    imagemagick \
    libwebp \
    tzdata \
    git \
    curl \
    bash \
    python3 \
    make \
    g++ \
    libc6-compat \
    ca-certificates \
    # Install sharp dependencies for better image processing
    vips-dev \
    fftw-dev \
    libjpeg-turbo-dev \
    # Needed for some node modules
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (using production flag for smaller installation)
RUN npm install --production && \
    # Explicitly install required packages
    npm install qrcode-terminal wa-sticker-formatter sharp && \
    # Install PM2 globally for process management
    npm install -g pm2

# Copy the rest of the application code
COPY . .

# Create required directories
RUN mkdir -p ./logs ./tmp ./sessions ./sessions-backup ./media

# Set environment variables for better performance
ENV NODE_ENV=production \
    PM2_HOME=/app/.pm2 \
    # Optimize Node.js garbage collection for containers
    NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size" \
    # Tell Puppeteer to skip installing Chrome
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    # Disable update notifier
    NO_UPDATE_NOTIFIER=1

# Expose the port that the health check server will run on
EXPOSE 5000

# Add healthcheck (executed inside container)
HEALTHCHECK --interval=60s --timeout=20s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Add volume for persistent data
VOLUME ["/app/sessions", "/app/logs", "/app/database.json"]

# Set entry point for PM2 runtime with enhanced logging and monitoring
CMD ["sh", "-c", "pm2-runtime ecosystem.config.js --env production"]

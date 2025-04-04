/**
 * BLACKSKY-MD Premium PM2 Configuration
 * Optimized for 24/7 operation on both Heroku and Termux
 * Includes auto-recovery, memory management, and graceful shutdown handling
 * Special optimizations for running in background on Android devices
 */
module.exports = {
  apps: [{
    // Base configuration
    name: "BLACKSKY-MD",
    script: "index.js",
    args: ["--autocleartmp", "--autoread"],
    
    // File watch settings
    watch: true,
    ignore_watch: [
      "node_modules", 
      "tmp", 
      "sessions", 
      "sessions-backup", 
      "database.json", 
      ".git", 
      "logs", 
      "*.log", 
      "tmp/*",
      "media/*",
      "temp/*"
    ],
    
    // Basic restart strategy
    autorestart: true,
    restart_delay: 5000,
    max_memory_restart: "1G", // Automatically restart if memory exceeds 1GB
    
    // Environment settings
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
      // These variables will be overridden by Heroku environment variables if set
      SESSION_ID: process.env.SESSION_ID || "BLACKSKY-MD",
      BOT_NAME: process.env.BOT_NAME || "BLACKSKY-MD",
      OWNER_NUMBER: process.env.OWNER_NUMBER || "",
      PREFIX: process.env.PREFIX || ".",
      // Platform detection
      HEROKU: process.env.HEROKU || "false",
      TERMUX: process.env.TERMUX || "true", // Enable Termux-specific optimizations
      PM2_SERVE_PORT: process.env.PORT || 5000,
      // Performance optimizations
      ENABLE_MEMORY_OPTIMIZATION: "true",
      ENABLE_SESSION_BACKUP: "true",
      OPTIMIZE_FOR_TERMUX: "true",
      // Background processing flags
      KEEP_ALIVE: "true", // Prevent Termux from killing the process
      NO_WARNINGS: "true" // Reduce console spam on Termux
    },
    
    // Advanced restart strategy for production
    exp_backoff_restart_delay: 100, // Exponential backoff for restarts
    max_restarts: 50, // Increased from 30 to 50 for better resilience
    min_uptime: "1m", // Consider restart successful only if it stays up for 1 minute
    listen_timeout: 15000, // Wait 15 seconds for app to start listening
    kill_timeout: 8000, // Give app 8 seconds for graceful shutdown
    wait_ready: true, // Wait for app to emit 'ready' event
    
    // Enhanced log management
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_file: "./logs/combined.log", // Combined logs
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    time: true, // Add timestamps to logs
    
    // Custom metadata for monitoring
    metadata: {
      build_date: new Date().toISOString(),
      version: "2.5.0 Premium",
      description: "BLACKSKY-MD Premium WhatsApp Bot",
      nodejs_version: process.version,
      platform: process.platform
    },
    
    // Advanced Node.js configuration for stability (optimized for Termux)
    node_args: [
      "--max_old_space_size=2048", // Reduced memory limit for mobile devices
      "--expose-gc", // Allow manual garbage collection
      "--optimize-for-size", // Optimize for smaller memory footprint
      "--max-http-header-size=8192", // Reduced HTTP header size for mobile
      "--no-warnings", // Suppress warnings
      "--abort-on-uncaught-exception=false", // Don't crash on uncaught exceptions
      "--unhandled-rejections=warn" // Only warn on unhandled promise rejections
    ],
    
    // Maintenance restart schedule - 4:00 AM daily in server timezone
    cron_restart: "0 4 * * *",
    
    // Lifecycle event hooks
    post_update: [
      "npm install", 
      "echo BLACKSKY-MD Bot updated at $(date)"
    ],
    pre_stop: [
      "node -e \"console.log('Gracefully stopping BLACKSKY-MD Bot...')\""
    ],
    
    // Runtime configuration
    exec_mode: "fork", // 'fork' is recommended for WhatsApp bots
    instances: 1, // Only run one instance to avoid connection conflicts
    
    // Debugging and error handling
    source_map_support: true, // Better error traces
    shutdown_with_message: true, // Clean shutdown with message
    
    // Heroku-specific settings
    vizion: false, // Disable Git integration to save memory
    increment_var: 'RESTART_COUNTER', // Track restart count
    
    // Graceful handling of SIGTERM (used by Heroku for dyno cycling)
    listen_on_sigint: true,
    kill_retry_time: 3000,
    
    // Memory leak detection
    deep_monitoring: true,
    tank_confirmation: false, // Don't ask for confirmation on stop/restart
    
    // Production mode setting
    prod_hook_enabled: true
  }]
};
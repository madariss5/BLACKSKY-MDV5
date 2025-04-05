/**
 * BLACKSKY-MD Premium - PM2 Ecosystem Configuration
 * 
 * This configuration file is used by PM2 to manage the bot process
 * Compatible with both Termux and Heroku environments
 */

// Detect if running in Termux
const os = require('os');
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';
const isHeroku = process.env.HEROKU === 'true' || !!process.env.DYNO;

// Configure memory limit based on environment
// Termux generally has less memory available
const memoryLimit = isTermux ? "384M" : "512M";
const oldSpaceSize = isTermux ? 256 : 512;

// Setting up arguments to pass to the bot
const botArgs = [
  "--autocleartmp", // Automatically clear temporary files
  "--autoread",     // Auto read messages (optional)
];

// Set up environment variables
const envVars = {
  NODE_ENV: "production",
  SESSION_ID: process.env.SESSION_ID || "BLACKSKY-MD",
  BOT_NAME: process.env.BOT_NAME || "BLACKSKY-MD",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "",
  
  // System variables
  PORT: process.env.PORT || 5000,
  
  // Feature flags
  ENABLE_MEMORY_OPTIMIZATION: "true",
  ENABLE_SESSION_BACKUP: "true",
  NO_WARNINGS: "true",
};

// Add environment-specific variables
if (isTermux) {
  Object.assign(envVars, {
    TERMUX: "true",
    OPTIMIZE_FOR_TERMUX: "true",
    KEEP_ALIVE: "true",
    SHARP_COMPAT: "true",
    TERMUX_PM2: "true",
  });
} else if (isHeroku) {
  Object.assign(envVars, {
    HEROKU: "true",
    KEEP_ALIVE: "true",
  });
}

// Main configuration
module.exports = {
  apps: [{
    name: "BLACKSKY-MD",
    script: "index.js",
    args: botArgs,
    watch: false,
    autorestart: true,
    restart_delay: 5000,
    max_memory_restart: memoryLimit,
    env: envVars,
    node_args: [
      "--expose-gc",
      `--max-old-space-size=${oldSpaceSize}`,
      "--optimize-for-size",
      "--no-warnings"
    ],
    cron_restart: "0 12 * * *", // Restart once a day at noon for freshness
    
    // Termux-specific options to prevent deep sleep
    shutdown_with_message: true,
    kill_timeout: 5000, // 5 seconds to clean up
    wait_ready: true, // Wait for the process to send 'ready' message
    listen_timeout: 30000, // 30 seconds to listen for ready signal
    
    // Recovery options
    max_restarts: 10,
    min_uptime: "60s",
    
    // Log configuration
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    error_file: "./logs/error.log",
    out_file: "./logs/output.log",
    merge_logs: true,
    
    // Special Termux setup script
    // This will run before the main app starts
    interpreter: isTermux ? "/data/data/com.termux/files/usr/bin/bash" : undefined,
    interpreter_args: isTermux ? ["-c", "termux-wake-lock && node"] : undefined,
  }],
  
  // Add a monitoring service for reliability
  ...(isTermux ? {
    apps: [{
      name: "PM2-Monitor",
      script: "pm2-service.js",
      watch: false,
      autorestart: true,
      max_memory_restart: "100M",
      env: {
        NODE_ENV: "production",
        TERMUX: "true",
        PM2_MONITOR: "true",
      },
      restart_delay: 10000, // 10 seconds
      cron_restart: "0 */6 * * *", // Restart every 6 hours
    }]
  } : {})
};
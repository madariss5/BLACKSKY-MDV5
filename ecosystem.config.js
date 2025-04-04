/**
 * BLACKSKY-MD Premium PM2 Configuration
 * Optimized for 24/7 operation on both Heroku and Termux
 * Includes auto-recovery, memory management, and graceful shutdown handling
 * Special optimizations for running in background on Android devices
 */
module.exports = {
  apps: [{
    name: "BLACKSKY-MD",
    script: "heroku-bot-starter.js",
    args: ["--autocleartmp", "--autoread"],
    watch: false,
    autorestart: true,
    restart_delay: 5000,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      SESSION_ID: process.env.SESSION_ID || "BLACKSKY-MD",
      BOT_NAME: process.env.BOT_NAME || "BLACKSKY-MD",
      OWNER_NUMBER: process.env.OWNER_NUMBER || "",
      PORT: process.env.PORT || 5000,
      // These variables are retained from the original for completeness, even if not explicitly in the edited snippet.
      HEROKU: process.env.HEROKU || "false",
      TERMUX: process.env.TERMUX || "true", 
      ENABLE_MEMORY_OPTIMIZATION: "true",
      ENABLE_SESSION_BACKUP: "true",
      OPTIMIZE_FOR_TERMUX: "true",
      KEEP_ALIVE: "true", 
      NO_WARNINGS: "true"
    },
    exp_backoff_restart_delay: 100,
    max_restarts: 50,
    min_uptime: "1m",
    listen_timeout: 15000,
    kill_timeout: 8000,
    wait_ready: true,
    node_args: [
      "--expose-gc",
      "--max-old-space-size=512",
      "--optimize-for-size",
      "--max-http-header-size=8192", // Retained from original for robustness.
      "--no-warnings",
      "--abort-on-uncaught-exception=false", 
      "--unhandled-rejections=warn"
    ],
    cron_restart: "0 4 * * *",
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_file: "./logs/combined.log", 
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    time: true,
    metadata: {
      build_date: new Date().toISOString(),
      version: "2.5.0 Premium",
      description: "BLACKSKY-MD Premium WhatsApp Bot",
      nodejs_version: process.version,
      platform: process.platform
    },
    exec_mode: "fork", 
    instances: 1, 
    source_map_support: true, 
    shutdown_with_message: true, 
    vizion: false, 
    increment_var: 'RESTART_COUNTER', 
    listen_on_sigint: true,
    kill_retry_time: 3000,
    deep_monitoring: true,
    tank_confirmation: false, 
    prod_hook_enabled: true,
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
    post_update: [
      "npm install", 
      "echo BLACKSKY-MD Bot updated at $(date)"
    ],
    pre_stop: [
      "node -e \"console.log('Gracefully stopping BLACKSKY-MD Bot...')\""
    ]
  }]
};
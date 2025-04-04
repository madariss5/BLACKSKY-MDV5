/**
 * BLACKSKY-MD Premium PM2 Configuration
 * Optimized for 24/7 operation on both Heroku and Termux
 * Includes auto-recovery, memory management, and graceful shutdown handling
 * Special optimizations for running in background on Android devices
 */

module.exports = {
  apps: [
    {
      // Main WhatsApp Bot process
      name: 'blacksky-md',
      script: './main.js',
      autorestart: true,
      watch: false,
      
      // Performance optimizations
      node_args: [
        // Enable garbage collection for better memory management
        '--expose-gc',
        
        // Optimize for production
        '--optimize_for_size',
        '--always_compact',
        
        // Advanced memory settings
        '--max-old-space-size=512',
        '--max-semi-space-size=128',
        
        // GC optimization
        '--max_old_space_size=512',
        '--optimize-for-size',
        '--gc-interval=100'
      ],
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PERFORMANCE_MODE: 'true',
        MEMORY_OPTIMIZATION: 'true'
      },
      
      // Process management
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '550M',
      
      // Restart settings
      restart_delay: 5000,
      max_restarts: 10,
      
      // Log settings
      output: './logs/output.log',
      error: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // Advanced settings
      kill_timeout: 8000,
      wait_ready: true,
      listen_timeout: 10000,
      cron_restart: '0 */6 * * *', // Restart every 6 hours
      
      // Special settings for Termux
      shutdown_with_message: true,
      exp_backoff_restart_delay: 100,
      
      // For Android optimization
      vizion: false,
      increment_var: 'INSTANCE_ID',
    },
    
    // Add a secondary app for API server if needed
    {
      name: 'blacksky-api',
      script: './server.js',
      autorestart: true,
      watch: false,
      
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Small process for API server
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '150M',
      
      restart_delay: 3000,
      max_restarts: 5,
      
      // Minimize logging for API server
      output: './logs/api-output.log',
      error: './logs/api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      
      vizion: false
    },
    
    // Heroku-specific app for 24/7 operation
    {
      name: 'blacksky-heroku',
      script: './heroku-bot-runner.js',
      autorestart: true,
      watch: false,
      
      // Heroku-specific optimizations
      node_args: [
        '--expose-gc',
        '--optimize_for_size',
        '--max-old-space-size=512'
      ],
      
      env: {
        NODE_ENV: 'production',
        HEROKU: 'true',
        PERFORMANCE_MODE: 'true',
        MEMORY_OPTIMIZATION: 'true'
      },
      
      // Less aggressive memory management for Heroku
      max_memory_restart: '490M',
      
      // Heroku-optimized restart strategy
      restart_delay: 10000,
      max_restarts: 20,
      
      // Heroku logs
      output: './logs/heroku-output.log',
      error: './logs/heroku-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      
      // Allow more time for startup on Heroku
      wait_ready: true,
      listen_timeout: 20000,
      kill_timeout: 10000,
      
      // No cron restart on Heroku (it has its own dyno cycling)
      vizion: false
    },
    
    // Connection keeper process
    {
      name: 'blacksky-keeper',
      script: './connection-keeper.js',
      autorestart: true,
      watch: false,
      
      // Low-resource process
      node_args: [],
      
      env: {
        NODE_ENV: 'production'
      },
      
      // Small footprint
      max_memory_restart: '100M',
      
      restart_delay: 1000,
      max_restarts: 50,
      
      // Minimal logging
      output: './logs/keeper-output.log',
      error: './logs/keeper-error.log',
      
      vizion: false
    }
  ]
};
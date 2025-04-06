/**
 * BLACKSKY-MD Premium - Combined Runner for Heroku
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize components
console.log('🧠 Initializing Memory Management...');
require('./memory-management.js');

console.log('🔄 Initializing Connection Keeper...');
require('./heroku-connection-keeper.js');

console.log('🔌 Initializing Connection Patch...');
require('./connection-patch.js');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start the bot process
console.log('🤖 Starting the WhatsApp bot...');
require('./index.js');

// Setup enhanced process monitoring
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  fs.appendFileSync(path.join(logsDir, 'error.log'), `${new Date().toISOString()} - Uncaught Exception: ${err.message}\n${err.stack}\n\n`);

  if (err.message && (
    err.message.includes('Connection terminated') || 
    err.message.includes('Stream error') ||
    err.message.includes('Socket closed') ||
    err.message.includes('read ECONNRESET')
  )) {
    console.log('🔄 Recoverable error detected - proceeding with automatic reconnection');
  }
});

// Graceful shutdown handler
async function performGracefulShutdown() {
  console.log('⚠️ Received shutdown signal. Performing graceful shutdown...');

  try {
    if (global.conn) {
      console.log('👋 Closing WhatsApp connection...');
      await global.conn.end();
    }

    console.log('✅ Shutdown completed. Exiting...');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }

  process.exit(0);
}

process.on('SIGTERM', performGracefulShutdown);
process.on('SIGINT', performGracefulShutdown);

console.log('✅ BLACKSKY-MD Premium is now running with optimized 24/7 configuration');
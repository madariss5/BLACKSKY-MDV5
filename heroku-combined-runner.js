/**
 * BLACKSKY-MD Premium - Combined Runner for Heroku
 * 
 * This script combines both the connection keeper and bot starter
 * for optimal 24/7 operation on Heroku with memory leak prevention.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize memory management to prevent leaks and event listener issues
console.log('🧠 Initializing Memory Management...');
const memoryManager = require('./memory-management.js');
memoryManager.initialize();

// Initialize heroku-connection-keeper
console.log('🔌 Initializing Heroku Connection Keeper...');
const connectionKeeperModule = require('./heroku-connection-keeper.js');
const keeper = connectionKeeperModule.initialize();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start the bot process directly
console.log('🤖 Starting the WhatsApp bot...');
require('./heroku-bot-starter.js');

// Setup enhanced process monitoring
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  fs.appendFileSync(path.join(logsDir, 'error.log'), `${new Date().toISOString()} - Uncaught Exception: ${err.message}\n${err.stack}\n\n`);
  
  // Check if this is a recoverable error
  if (err.message && (
    err.message.includes('Connection terminated') || 
    err.message.includes('Stream error') ||
    err.message.includes('Socket closed') ||
    err.message.includes('read ECONNRESET')
  )) {
    console.log('Recoverable error detected - proceeding with automatic reconnection');
    // The connection keeper module will handle the reconnection
  }
});

// Schedule periodic memory cleanup
const MEMORY_CLEANUP_INTERVAL = 15; // minutes
memoryManager.scheduleMemoryCleanup(MEMORY_CLEANUP_INTERVAL);

// Graceful shutdown
async function performGracefulShutdown() {
  console.log('⚠️ Received shutdown signal. Performing graceful shutdown...');
  
  try {
    // Call the keeper's graceful shutdown
    await connectionKeeperModule.performGracefulShutdown();
    
    // Perform final memory cleanup
    memoryManager.performMemoryCleanup();
    
    console.log('✅ Shutdown completed. Exiting...');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  // Force exit after timeout to prevent hanging
  setTimeout(() => {
    console.log('Forcing exit after timeout');
    process.exit(0);
  }, 5000);
}

// Use the safe event handler attachment
memoryManager.safeOn(process, 'SIGTERM', performGracefulShutdown);
memoryManager.safeOn(process, 'SIGINT', performGracefulShutdown);

// Add Heroku dyno shutdown event handler
memoryManager.safeOn(process, 'SIGUSR2', async () => {
  console.log('Received Heroku dyno cycling signal (SIGUSR2)');
  await performGracefulShutdown();
});

console.log('✅ BLACKSKY-MD Premium is now running with optimized 24/7 configuration and memory management');
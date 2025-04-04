/**
 * BLACKSKY-MD Bot Starter for Heroku with enhanced stability
 */
const { initialize: initKeeper } = require('./heroku-connection-keeper.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 0; // Using port 0 lets the OS assign an available port

// Initialize connection keeper
const keeper = initKeeper();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server first
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`⚡ Server running on port ${port}`);

  // Start bot after server is confirmed running
  setTimeout(() => {
    try {
      require('./index.js');
      console.log('✅ Bot started successfully');
    } catch (err) {
      console.error('❌ Error starting bot:', err);
      // Attempt to restart after delay
      console.log('🔄 Will attempt to restart in 10 seconds...');
      setTimeout(() => {
        try {
          require('./index.js');
          console.log('✅ Bot restarted successfully');
        } catch (restartErr) {
          console.error('❌ Error restarting bot:', restartErr);
          process.exit(1); // Exit with error code
        }
      }, 10000);
    }
  }, 1000);
});


// Make sure the server is properly handling errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Trying another port...`);
    // Try another port
    server.close();
    app.listen(0, '0.0.0.0', () => {
      console.log(`⚡ Server running on a random port`);
      setTimeout(() => {
        try {
          require('./index.js');
          console.log('✅ Bot started successfully on random port');
        } catch (err) {
          console.error('❌ Error starting bot on random port:', err);
          process.exit(1);
        }
      }, 1000);
    });
  }
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM signal. Heroku is cycling dynos.');
  console.log('💾 Attempting to save sessions before shutdown...');
  // Allow time for cleanup before Heroku kills the process
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT signal. Shutting down gracefully...');
  process.exit(0);
});
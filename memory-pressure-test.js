// Memory pressure test endpoint
// Import Express
const express = require('express');
const app = express();

// Create a route that simulates high memory usage
app.get('/simulate-memory-pressure', (req, res) => {
  console.log('🚨 Manual memory pressure test triggered');
  
  if (global.memoryManager) {
    try {
      // Get current memory usage
      const memoryInfo = global.memoryManager.getMemoryUsage();
      console.log(`Current memory usage: ${JSON.stringify(memoryInfo.percentages)} / ${JSON.stringify(memoryInfo.formatted)}`);
      
      // Trigger a custom high memory event
      console.log('🧹 Running manual memory cleanup...');
      global.memoryManager.runCleanup();
      
      // Trigger emergency cleanup
      console.log('🚨 Running emergency cleanup...');
      global.memoryManager.runEmergencyCleanup();
      
      res.send({
        success: true,
        message: 'Memory pressure test completed',
        memoryInfo
      });
    } catch (error) {
      console.error('Error in memory pressure test:', error);
      res.status(500).send({
        success: false,
        error: error.message
      });
    }
  } else {
    console.log('⚠️ Memory manager not available');
    res.status(404).send({
      success: false,
      error: 'Memory manager not available'
    });
  }
});

// Start the server on port 3500
const server = app.listen(3500, () => {
  console.log('Memory pressure test server running on port 3500');
});

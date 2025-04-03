require('./index')
require('./handler')

// Initialize additional handlers and helpers
const { initCiphertextHandler } = require('./lib/ciphertext-handler');
const { initAutoCleanup } = require('./lib/auto-cleanup');
const { initConsoleFixModule } = require('./lib/console-fix');
const messageDeduplication = require('./lib/message-deduplication');

// Set global reference to message deduplication system
global.messageDeduplication = messageDeduplication;

// Initialize console fix if not already done
if (!global.__consoleFixed) {
  initConsoleFixModule();
}

// Initialize auto-cleanup if not already done
if (!global.autoCleanup) {
  global.autoCleanup = initAutoCleanup();
  console.log('[AUTO-CLEANUP] Initialized auto-cleanup system');
}

// Check if global connection object is available, then initialize handlers
if (global.conn && global.conn.ev) {
  try {
    // Initialize the CIPHERTEXT message handler
    const ciphertextHandler = initCiphertextHandler(global.conn);
    if (ciphertextHandler && typeof ciphertextHandler.initialize === 'function') {
      ciphertextHandler.initialize();
      console.log('[CIPHERTEXT-HANDLER] Initialized specialized CIPHERTEXT message handler');
    } else {
      console.log('[CIPHERTEXT-HANDLER] Initialization skipped - handler object not valid');
    }
    
    // Initialize connection optimizer if not already initialized
    if (global.connectionOptimizer && !global.connectionOptimizer.isInitialized) {
      global.connectionOptimizer.instance = global.connectionOptimizer.init(global.conn);
      global.connectionOptimizer.instance.optimize();
      global.connectionOptimizer.isInitialized = true;
      console.log('[CONNECTION] Connection optimizer has been initialized');
    }
    
    // Initialize enhanced memory management if not already initialized
    if (global.enhancedMemory && !global.enhancedMemory.isInitialized) {
      global.enhancedMemory.instance = global.enhancedMemory.init(global.conn);
      global.enhancedMemory.isInitialized = true;
      console.log('[MEMORY] Enhanced memory management system has been initialized');
    }
    
    // Initialize error handling system if not already initialized
    if (global.errorHandling && !global.errorHandling.isInitialized) {
      global.errorHandling.init(global.conn);
      global.errorHandling.isInitialized = true;
      console.log('[ERROR-HANDLING] Error handling system has been initialized');
    }
  } catch (err) {
    console.error('[INIT] Error during initialization:', err);
  }
} else {
  console.log('[INIT] Waiting for connection to initialize additional handlers');
  
  // Set up an interval to check for connection and initialize handlers when available
  const initInterval = setInterval(() => {
    if (global.conn && global.conn.ev) {
      clearInterval(initInterval);
      
      try {
        // Initialize the CIPHERTEXT message handler
        const ciphertextHandler = initCiphertextHandler(global.conn);
        if (ciphertextHandler && typeof ciphertextHandler.initialize === 'function') {
          ciphertextHandler.initialize();
          console.log('[CIPHERTEXT-HANDLER] Initialized specialized CIPHERTEXT message handler');
        } else {
          console.log('[CIPHERTEXT-HANDLER] Initialization skipped - handler object not valid');
        }
        
        // Initialize connection optimizer if not already initialized
        if (global.connectionOptimizer && !global.connectionOptimizer.isInitialized) {
          global.connectionOptimizer.instance = global.connectionOptimizer.init(global.conn);
          global.connectionOptimizer.instance.optimize();
          global.connectionOptimizer.isInitialized = true;
          console.log('[CONNECTION] Connection optimizer has been initialized');
        }
        
        // Initialize enhanced memory management if not already initialized
        if (global.enhancedMemory && !global.enhancedMemory.isInitialized) {
          global.enhancedMemory.instance = global.enhancedMemory.init(global.conn);
          global.enhancedMemory.isInitialized = true;
          console.log('[MEMORY] Enhanced memory management system has been initialized');
        }
        
        // Initialize error handling system if not already initialized
        if (global.errorHandling && !global.errorHandling.isInitialized) {
          global.errorHandling.init(global.conn);
          global.errorHandling.isInitialized = true;
          console.log('[ERROR-HANDLING] Error handling system has been initialized');
        }
      } catch (err) {
        console.error('[INIT] Error during delayed initialization:', err);
      }
    }
  }, 1000);
  
  // Register the interval with auto-cleanup system
  if (global.autoCleanup && typeof global.autoCleanup.registerTimer === 'function') {
    global.autoCleanup.registerTimer(initInterval, 'initialization-check-interval');
  }
}
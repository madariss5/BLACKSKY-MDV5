/**
 * BLACKSKY-MD Premium - Enhanced Connection Keeper
 * 
 * This module provides advanced connection stability measures to prevent
 * "connection appears to be closed" errors and other disconnection issues.
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state monitoring and proactive fixes
 * - Connection keepalive through periodic heartbeats
 * - Socket error handling and recovery
 * - Memory usage optimization for long-term stability
 * - Websocket state validation
 * - Robust recovery from connection issues
 */

// Safely import Baileys dependencies with fallbacks
let delay, DisconnectReason, Boom;

try {
  // Try to load from Baileys
  const baileys = require('@adiwajshing/baileys');
  delay = baileys.delay;
  DisconnectReason = baileys.DisconnectReason;

  // Log what codes are available for debugging
  console.log('Loaded DisconnectReason codes:', Object.keys(DisconnectReason || {}));
} catch (baileyError) {
  console.error('Error loading Baileys:', baileyError.message);
  // Provide fallbacks
  delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  DisconnectReason = {
    loggedOut: 401,
    restartRequired: 500,
    connectionClosed: 428,
    timedOut: 408,
    connectionLost: 503
  };
}

try {
  // Try to load Boom
  const hapiModule = require('@hapi/boom');
  Boom = hapiModule.Boom;
} catch (boomErr) {
  console.error('Error loading @hapi/boom:', boomErr.message);
  // Create a simple Boom-like class as fallback
  Boom = class FakeBoom extends Error {
    constructor(message, options = {}) {
      super(message);
      this.statusCode = options.statusCode || 500;
      this.output = {
        statusCode: options.statusCode || 500,
        payload: {
          error: 'Boom Error',
          message: message
        }
      };
      this.data = options.data || {};
    }
  };
}

const os = require('os');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Create a custom event emitter for connection events
const connectionEvents = new EventEmitter();
connectionEvents.setMaxListeners(500); // Significantly increased to prevent MaxListenersExceededWarning

// Configure colors for better logging
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Log a message with timestamp and color
 * @param {string} message - Message to log
 * @param {string} type - Log type (INFO, ERROR, WARN, SUCCESS)
 */
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  let color = colors.reset;

  switch (type.toUpperCase()) {
    case 'ERROR':
      color = colors.red;
      break;
    case 'WARN':
      color = colors.yellow;
      break;
    case 'SUCCESS':
      color = colors.green;
      break;
    case 'INFO':
      color = colors.cyan;
      break;
    default:
      color = colors.reset;
  }

  console.log(`${color}[CONNECTION-KEEPER][${type}][${timestamp}] ${message}${colors.reset}`);
}

// Keep track of connection state
const connectionState = {
  isConnected: false,
  lastConnected: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 50, // More attempts before giving up
  reconnectDelay: 1000,
  maxReconnectDelay: 15000,
  heartbeatInterval: 20000, // More frequent heartbeat
  socketTimeout: 45000,
  connectionStrategies: ['websocket', 'longpoll', 'http'],
  currentStrategy: 0,
  failedAttempts: {},
  // Track different connection methods
  connectionMethods: {
    websocket: { maxAttempts: 20, delay: 1000 },
    longpoll: { maxAttempts: 15, delay: 2000 },
    http: { maxAttempts: 15, delay: 3000 }
  },
  // Enhanced state tracking
  state: {
    lastPing: null,
    lastPong: null,
    messagesSent: 0,
    messagesReceived: 0,
    currentRetryCount: 0
  } // Start with 2 seconds
};

const maxReconnectDelay = 15000; // Max 15 seconds
const heartbeatInterval = 25000; // More frequent heartbeat
const connectionCheckInterval = 15000; // Faster connection checks
const maxRetries = 10; // Maximum number of quick retries
let lastHeartbeat = null;
let socketErrorCount = 0;
const maxSocketErrors = 5;
const socketErrorResetTime = 60000; // 1 minute
let lastSocketErrorTime = null;
let isReconnecting = false; // Flag to prevent concurrent reconnection attempts
const initialBackoffDelay = 2000; // Start with shorter delay
const backoffFactor = 1.3; // Gentler backoff
const socketTimeout = 60000; // Socket timeout
const keepAliveInterval = 25000; // Keep-alive interval


/**
 * Initialize the connection keeper
 * @param {Object} conn - Baileys connection object
 */
function initializeConnectionKeeper(conn) {
  if (!conn || typeof conn !== 'object') {
    log('Invalid connection object provided to initializeConnectionKeeper', 'ERROR');
    return false;
  }
  if (!conn) {
    log('No connection object provided', 'ERROR');
    return false;
  }

  log('Initializing enhanced connection keeper...', 'INFO');

  // Set up connection state listeners
  setupConnectionListeners(conn);

  // Start regular connection checks
  startConnectionChecks(conn);

  // Set up heartbeat to keep connection alive
  startHeartbeat(conn);

  // Set up memory usage monitoring
  startMemoryMonitoring();

  // Set up global error handlers
  setupGlobalErrorHandlers(conn);

  log('Connection keeper initialized successfully', 'SUCCESS');
  return true;
}

/**
 * Set up connection state listeners
 * @param {Object} conn - Baileys connection object
 */
function setupConnectionListeners(conn) {
  // Listen for close events
  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401; // Don't reconnect if unauthorized

      log(`Connection closed with status code: ${statusCode}`, 'WARN');
      connectionState.isConnected = false;

      if (shouldReconnect) {
        handleReconnection(conn);
      } else {
        log('Authentication failed, not attempting reconnect', 'ERROR');
        // Notify the application about authentication failure
        connectionEvents.emit('auth.failure', lastDisconnect?.error);
      }
    } else if (connection === 'open') {
      log('Connection opened successfully', 'SUCCESS');
      connectionState.isConnected = true;
      connectionState.lastConnected = Date.now();
      connectionState.reconnectAttempts = 0;
      connectionState.reconnectDelay = connectionState.initialBackoffDelay; // Reset reconnect delay

      // Notify about successful connection
      connectionEvents.emit('connection.success');
    }
  });

  // Listen for socket errors which often precede connection closed errors
  conn.ws.on('error', (err) => {
    log(`WebSocket error: ${err.message}`, 'ERROR');
    connectionState.socketErrorCount++;
    connectionState.lastSocketErrorTime = Date.now();

    // If we have too many socket errors in a short time, force reconnection
    if (connectionState.socketErrorCount >= connectionState.maxSocketErrors) {
      log('Too many socket errors, forcing reconnection', 'WARN');
      handleReconnection(conn);
    }
  });

  // Listen for unexpected socket close
  conn.ws.on('close', () => {
    log('WebSocket closed unexpectedly', 'WARN');
    if (connectionState.isConnected) {
      connectionState.isConnected = false;
      handleReconnection(conn);
    }
  });

  // Listen for socket error count reset
  setInterval(() => {
    if (connectionState.lastSocketErrorTime && 
        (Date.now() - connectionState.lastSocketErrorTime) > connectionState.socketErrorResetTime) {
      connectionState.socketErrorCount = 0;
      connectionState.lastSocketErrorTime = null;
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Start regular connection checks
 * @param {Object} conn - Baileys connection object
 */
function startConnectionChecks(conn) {
  // Clear any existing interval
  if (connectionState.connectionCheckInterval) {
    clearInterval(connectionState.connectionCheckInterval);
  }

  // Set up new check interval
  connectionState.connectionCheckInterval = setInterval(() => {
    checkConnection(conn);
  }, connectionState.connectionCheckInterval); // Check every 20 seconds

  log('Regular connection checks started', 'INFO');
}

/**
 * Check if connection is still active and working
 * @param {Object} conn - Baileys connection object
 */
async function checkConnection(conn) {
  try {
    // Only check if we think we're connected
    if (!connectionState.isConnected) {
      return;
    }

    // Check if the socket is actually open
    const isSocketConnected = conn.ws && conn.ws.readyState === 1; // WebSocket.OPEN

    // Check socket status for additional health indicators
    if (conn.ws) {
      if (conn.ws.readyState === 2 || conn.ws.readyState === 3) {
        log('WebSocket in CLOSING or CLOSED state, connection is inactive', 'WARN');
        connectionState.isConnected = false;
        handleReconnection(conn);
        return;
      }

      // If socket is in connecting state for too long, consider it problematic
      if (conn.ws.readyState === 0) {
        const connectingTime = Date.now() - (conn.wsStartTime || Date.now());
        if (connectingTime > 10000) { // 10 seconds
          log(`WebSocket has been in CONNECTING state for ${Math.round(connectingTime/1000)}s, connection may be stale`, 'WARN');
          connectionState.isConnected = false;
          handleReconnection(conn);
          return;
        }
      }
    }

    // Check if we have user data (indicates successful auth)
    const hasUserData = !!conn.user;

    // Check for pending requests that might have timed out
    let hasStalePendingRequests = false;
    if (conn.pendingRequestTimeoutMs && conn.pendingRequests) {
      const stalePendingRequests = Object.values(conn.pendingRequests).filter(req => {
        const elapsed = Date.now() - req.startTime;
        return elapsed > 30000; // 30 seconds is too long for a request
      });

      if (stalePendingRequests.length > 2) {
        log(`Found ${stalePendingRequests.length} stale pending requests, connection may be stale`, 'WARN');
        hasStalePendingRequests = true;
      }
    }

    // Check if heartbeat is recent enough
    const hasRecentHeartbeat = connectionState.lastHeartbeat && 
      (Date.now() - connectionState.lastHeartbeat) < 45000; // Within last 45 seconds

    if (!isSocketConnected || !hasUserData || hasStalePendingRequests) {
      log('Connection check failed - socket, user data, or pending requests issue', 'WARN');
      connectionState.isConnected = false;
      handleReconnection(conn);
      return;
    }

    if (!hasRecentHeartbeat) {
      log('No recent heartbeat detected, sending test ping', 'WARN');
      // Try to send a ping to see if connection is responsive
      try {
        await sendHeartbeat(conn);
      } catch (heartbeatError) {
        log(`Heartbeat test failed: ${heartbeatError.message}`, 'ERROR');
        connectionState.isConnected = false;
        handleReconnection(conn);
        return;
      }
    }

    // Additional check: try a simple query to verify two-way communication
    try {
      const pingStart = Date.now();
      await conn.query({
        tag: 'ping',
        attrs: {}
      });
      const pingTime = Date.now() - pingStart;

      if (pingTime > 5000) {
        log(`Ping response time is slow (${pingTime}ms), connection may be degraded`, 'WARN');
      } else {
        log(`Ping response time: ${pingTime}ms`, 'DEBUG');
      }
    } catch (pingError) {
      log(`Ping test failed: ${pingError.message}`, 'ERROR');
      connectionState.isConnected = false;
      handleReconnection(conn);
      return;
    }

    log('Connection check passed', 'INFO');
  } catch (error) {
    log(`Connection check error: ${error.message}`, 'ERROR');
    connectionState.isConnected = false;
    handleReconnection(conn);
  }
}

/**
 * Handle reconnection with exponential backoff
 * @param {Object} conn - Baileys connection object
 */
async function handleReconnection(conn) {
  // Check if already attempting to reconnect to avoid duplicate reconnections
  if (connectionState.isReconnecting) {
    log('Already attempting to reconnect, skipping duplicate reconnection', 'INFO');
    return;
  }

  // Mark that we're trying to reconnect
  connectionState.isReconnecting = true;

  try {
    // Check if socket is already open - might have recovered itself
    if (conn.ws && conn.ws.readyState === 1 && conn.user) {
      log('Connection already appears restored, canceling reconnection', 'SUCCESS');
      connectionState.isConnected = true;
      connectionState.isReconnecting = false;
      return;
    }

    // Check if we've exceeded max attempts
    if (connectionState.reconnectAttempts >= connectionState.maxReconnectAttempts) {
      log('Maximum reconnection attempts reached, trying final recovery options', 'ERROR');

      // Try final recovery option - full reload if we have the function
      if (typeof global.restartConnection === 'function') {
        log('Attempting full bot restart via global.restartConnection', 'INFO');
        global.restartConnection();
        // Reset state after attempting restart
        connectionState.reconnectAttempts = 0;
        connectionState.isReconnecting = false;
        return;
      }

      // If we can't restart the whole bot, reset the counter and continue trying
      log('No restart function available, resetting counter and continuing to try', 'WARN');
      connectionState.reconnectAttempts = 0;
      connectionEvents.emit('reconnect.maxattempts');
    }

    // Calculate delay with exponential backoff and some jitter
    // Use an extremely aggressive reconnection strategy with very short initial delay
    const baseDelay = Math.min(
      connectionState.initialBackoffDelay + (connectionState.reconnectAttempts * connectionState.initialBackoffDelay * connectionState.backoffFactor),
      maxReconnectDelay
    );
    const jitter = Math.random() * 300; // Add up to 0.3 second of random jitter
    const delay = Math.min(baseDelay + jitter, 10000); // Cap max delay at 10 seconds

    connectionState.reconnectAttempts++;
    console.log(`⚠️ Connection appears to be closed. Attempt #${connectionState.reconnectAttempts} to reconnect...`);
    log(`Attempting reconnection ${connectionState.reconnectAttempts}/${connectionState.maxReconnectAttempts} in ${Math.round(delay)}ms`, 'INFO');

    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Check if the connection has already recovered on its own
    if (conn.ws && conn.ws.readyState === 1 && conn.user) {
      log('Connection appears to have recovered while waiting to reconnect', 'SUCCESS');
      connectionState.isConnected = true;
      connectionState.isReconnecting = false;
      connectionState.reconnectAttempts = 0;
      return;
    }

    // First try to restore credentials if available and connection seems corrupted
    let usedCredRestore = false;
    if (connectionState.reconnectAttempts > 2 && !conn.authState?.creds?.me) {
      try {
        log('Connection credentials appear corrupted, attempting to restore', 'WARN');

        // Try different methods of credential restoration
        if (global.authFolder && global.loadAuthFromFolder) {
          log('Attempting to restore credentials from auth folder', 'INFO');
          global.loadAuthFromFolder();
          usedCredRestore = true;
        } else if (typeof global.authState?.saveCreds === 'function') {
          log('Attempting to reload auth state', 'INFO');
          await global.authState.saveCreds();
          usedCredRestore = true;
        }
      } catch (credError) {
        log(`Credential restoration error: ${credError.message}`, 'ERROR');
      }
    }

    // Try different reconnection strategies based on attempt number
    try {
      // If global.reloadHandler exists and this is one of the early attempts, use it
      if (global.reloadHandler && connectionState.reconnectAttempts < 5) {
        log('Using global.reloadHandler for reconnection', 'INFO');
        global.reloadHandler(true);
      } 
      // If we have a custom restart function and we're on a higher attempt, use it
      else if (typeof global.restartWhatsApp === 'function' && connectionState.reconnectAttempts >= 5) {
        log('Using global.restartWhatsApp for deeper reconnection', 'INFO');
        global.restartWhatsApp();
      }
      // Otherwise, use our own reconnection logic
      else {
        log('Using manual socket reconnection', 'INFO');

        // Close socket if it exists
        if (conn.ws) {
          try {
            conn.ws.close();
          } catch (closeErr) {
            log(`Error closing socket: ${closeErr.message}`, 'WARN');
          }
        }

        // Wait just a short time after closing the socket for immediate reconnection
        await new Promise(resolve => setTimeout(resolve, 300));

        // Try to force Baileys to reconnect by emitting a connection.update event
        try {
          // Use Baileys' restart required reason code
          const restartCode = typeof DisconnectReason !== 'undefined' ? 
                             DisconnectReason.restartRequired : 
                             500;

          conn.ev.emit('connection.update', {
            connection: 'close',
            lastDisconnect: {
              error: new Boom('Forced reconnection by enhanced connection keeper', {
                statusCode: restartCode,
                data: {
                  forceReconnect: true,
                  isTransient: true
                }
              })
            }
          });
        } catch (emitErr) {
          log(`Error emitting connection update: ${emitErr.message}`, 'ERROR');
        }
      }

      log('Reconnection initiated', 'INFO');
    } catch (error) {
      log(`Reconnection error: ${error.message}`, 'ERROR');
      // Schedule another attempt with a short delay
      setTimeout(() => {
        connectionState.isReconnecting = false;
        handleReconnection(conn);
      }, 3000);
    }
  } finally {
    // Reset reconnecting flag after a delay to allow reconnection to happen
    setTimeout(() => {
      connectionState.isReconnecting = false;
    }, 10000);
  }
}

/**
 * Start heartbeat to keep connection alive
 * @param {Object} conn - Baileys connection object
 */
function startHeartbeat(conn) {
  // Clear any existing interval
  if (connectionState.heartbeatInterval) {
    clearInterval(connectionState.heartbeatInterval);
  }

  // Set up new heartbeat interval
  connectionState.heartbeatInterval = setInterval(() => {
    if (connectionState.isConnected) {
      sendHeartbeat(conn);
    }
  }, heartbeatInterval); // Every 30 seconds

  log('Connection heartbeat started', 'INFO');
}

/**
 * Send a heartbeat to keep the connection alive
 * @param {Object} conn - Baileys connection object
 */
async function sendHeartbeat(conn) {
  try {
    // Check if we have a valid connection before sending
    if (!conn || !conn.ws || conn.ws.readyState !== 1) {
      return;
    }

    // Send a simple query to the server
    // This is a lightweight operation that helps keep the connection active
    await conn.query({
      tag: 'ping',
      attrs: {}
    });

    connectionState.lastHeartbeat = Date.now();
    log('Heartbeat sent successfully', 'INFO');
  } catch (error) {
    log(`Heartbeat error: ${error.message}`, 'ERROR');
    // If heartbeat fails, the connection might be dead
    if (connectionState.isConnected) {
      connectionState.isConnected = false;
      handleReconnection(conn);
    }
  }
}

/**
 * Set up global error handlers
 * @param {Object} conn - Baileys connection object
 */
function setupGlobalErrorHandlers(conn) {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection: ${reason}`, 'ERROR');

    // If it's a connection-related error, try to reconnect
    if (reason && reason.message && (
      reason.message.includes('Connection closed') ||
      reason.message.includes('connection closed') ||
      reason.message.includes('timed out') ||
      reason.message.includes('socket') ||
      reason.message.includes('WebSocket')
    )) {
      log('Connection-related unhandled rejection detected, attempting recovery', 'WARN');
      if (connectionState.isConnected) {
        connectionState.isConnected = false;
        handleReconnection(conn);
      }
    }
  });

  // Handle uncaught exceptions, but don't exit
  process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`, 'ERROR');

    // If it's a connection-related error, try to reconnect
    if (err.message && (
      err.message.includes('Connection closed') ||
      err.message.includes('connection closed') ||
      err.message.includes('timed out') ||
      err.message.includes('socket') ||
      err.message.includes('WebSocket')
    )) {
      log('Connection-related uncaught exception detected, attempting recovery', 'WARN');
      if (connectionState.isConnected) {
        connectionState.isConnected = false;
        handleReconnection(conn);
      }
    }
  });
}

/**
 * Monitor memory usage and trigger garbage collection if needed
 */
function startMemoryMonitoring() {
  // Set up interval to check memory usage
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const rss = Math.round(memoryUsage.rss / 1024 / 1024);

    if (heapUsed > 200 || rss > 300) {
      log(`High memory usage detected: Heap ${heapUsed}MB, RSS ${rss}MB`, 'WARN');

      // Try to reduce memory usage
      if (global.gc) {
        log('Triggering manual garbage collection', 'INFO');
        global.gc();
      }
    }
  }, 60000); // Check every minute
}

/**
 * Force reconnection manually
 * @param {Object} conn - Baileys connection object
 */
function forceReconnect(conn) {
  log('Manual reconnection triggered', 'INFO');
  connectionState.isConnected = false;
  handleReconnection(conn);
}

/**
 * Get current connection state
 * @returns {Object} - Current connection state
 */
function getConnectionState() {
  return {
    ...connectionState,
    uptime: connectionState.lastConnected ? Math.floor((Date.now() - connectionState.lastConnected) / 1000) : 0
  };
}

/**
 * Apply connection patch to fix common issues
 * @param {Object} conn - Baileys connection object
 * @returns {Boolean} - Whether patches were successfully applied
 */
function applyConnectionPatch(conn) {
  if (!conn) {
    log('No connection object provided', 'ERROR');
    return false;
  }

  try {
    // 1. Patch the query function with improved error handling
    // Save the original query function
    const originalQuery = conn.query.bind(conn);

    // Replace with our enhanced version
    conn.query = async (node, timeout = connectionState.socketTimeout) => {
      try {
        // Add random jitter to timeout to avoid thundering herd problem
        const jitteredTimeout = timeout + Math.floor(Math.random() * 2000);
        return await originalQuery(node, jitteredTimeout);
      } catch (error) {
        // Handle connection closed errors with special care
        if (error.message && (
          error.message.includes('Connection closed') ||
          error.message.includes('connection closed') ||
          error.message.includes('appears to be closed') ||
          error.message.includes('timed out') ||
          error.message.includes('socket') ||
          error.message.includes('WebSocket')
        )) {
          log(`Query error: ${error.message}, attempting recovery`, 'WARN');
          console.log(`⚠️ Connection issue detected: ${error.message.substring(0, 100)}`);

          if (connectionState.isConnected) {
            connectionState.isConnected = false;
            // Initiate reconnection immediately without delay
            handleReconnection(conn);
          }
        }
        throw error;
      }
    };

    // 2. Patch the connection event handler
    if (conn.ev) {
      // Create a new function to handle connection updates
      function handleConnectionUpdate(update) {
        try {
          const { connection, lastDisconnect, qr } = update;

          // Update connection state based on update
          if (connection === 'open') {
            console.log('✅ Connection is now open!');
            connectionState.isConnected = true;
            connectionState.reconnectAttempts = 0;
            connectionState.lastConnected = Date.now();
            connectionEvents.emit('connect');

            // After successful connection, set up heartbeat
            startHeartbeat(conn);
          } 
          else if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const errMsg = lastDisconnect?.error?.message || '';

            // Log detailed information for debugging
            console.log(`⚠️ Connection close detected with status: ${statusCode}, message: ${errMsg}`);

            // Mark as disconnected immediately
            connectionState.isConnected = false;

            // Handle Baileys specific codes - loggedOut is usually code 401
            if (statusCode === 401 || (typeof DisconnectReason !== 'undefined' && statusCode === DisconnectReason.loggedOut)) {
              console.log('⛔ Account logged out (status code 401), reconnection canceled');
              // Don't attempt to reconnect if logged out
              connectionEvents.emit('logout');
              return;
            }

            // If restartRequired, we'll let baileys handle it if possible
            if (statusCode === 515 || (typeof DisconnectReason !== 'undefined' && statusCode === DisconnectReason.restartRequired)) {
              console.log('🔄 Restart required, letting Baileys handle reconnection');
              return;
            }

            // If connection closed because of connection appears closed error
            if (errMsg.includes('closed') || errMsg.includes('timed out')) {
              console.log('⚠️ Connection appears to be closed error detected, initiating fast reconnection');
              // Use our own reconnection logic with immediate initiation
              handleReconnection(conn);
              // Try to prevent default Baileys handlers from running multiple reconnects
              return;
            }
          }
          else if (connection === 'connecting') {
            console.log('🔄 Connection status: connecting...');
          }
        } catch (err) {
          console.error('❌ Error in connection update handler:', err.message);
        }
      }

      // Register our handler
      conn.ev.on('connection.update', handleConnectionUpdate);
    }

    // 3. Add socket error handlers if not already added
    if (conn.ws && !conn.ws._patchedErrorHandlers) {
      // Add a special handler for WS errors
      const socketErrorHandler = (err) => {
        console.log(`⚠️ WebSocket error: ${err.message}`);

        // If connection is still marked as connected, mark it disconnected
        if (connectionState.isConnected) {
          connectionState.isConnected = false;
          // Initiate reconnection immediately without delay
          handleReconnection(conn);
        }
      };

      // Add the handler
      conn.ws.on('error', socketErrorHandler);

      // Mark as patched to avoid duplicate handlers
      conn.ws._patchedErrorHandlers = true;
    }

    // 4. Patch the send function to detect early "connection appears to be closed" errors
    if (conn.sendNode) {
      const originalSendNode = conn.sendNode.bind(conn);

      conn.sendNode = async (...args) => {
        try {
          return await originalSendNode(...args);
        } catch (error) {
          if (error.message && error.message.includes('closed')) {
            console.log(`⚠️ sendNode detected closed connection: ${error.message}`);

            if (connectionState.isConnected) {
              connectionState.isConnected = false;
              // Initiate reconnection immediately without delay
              handleReconnection(conn);
            }
          }
          throw error;
        }
      };
    }

    log('Applied comprehensive connection patches for improved stability', 'SUCCESS');
    return true;
  } catch (err) {
    log(`Error applying connection patches: ${err.message}`, 'ERROR');
    console.error('Connection patch error details:', err);
    return false;
  }
}

/**
 * Initialize with a delayed connection check if conn isn't ready yet
 * @param {Object} conn - Baileys connection object (can be null for delayed initialization)
 * @param {Object} options - Optional configuration for initialization
 * @returns {Boolean} - Whether initialization was successful
 */
function safeInitialize(conn = null, options = {}) {
  // Log that we are starting in safe mode
  log('Starting enhanced connection keeper in safe mode with optimal settings', 'INFO');
  // Default options
  const defaultOptions = {
    pollInterval: 5000,        // 5 seconds between checks
    maxAttempts: 60,           // 5 minutes maximum waiting time
    applyPatches: true,        // Apply connection patches immediately
    forceReconnect: false,     // Force reconnection on first available connection
    verbose: true              // Show detailed logs
  };

  // Merge options with defaults
  const config = { ...defaultOptions, ...options };

  // If we have a connection, initialize directly
  if (conn) {
    // Apply patches if requested
    if (config.applyPatches) {
      applyConnectionPatch(conn);
    }

    // Force reconnect if requested
    if (config.forceReconnect && conn.ws) {
      try {
        // Only force reconnect if we appear to have an established connection
        if (conn.user || conn.ws.readyState === 1) {
          log('Forcing initial reconnection as requested', 'INFO');
          forceReconnect(conn);
        }
      } catch (err) {
        log(`Error during forced reconnect: ${err.message}`, 'ERROR');
      }
    }

    // Initialize the connection keeper
    return initializeConnectionKeeper(conn);
  } else {
    // Otherwise set up a polling system to wait for global.conn
    if (config.verbose) {
      console.log('🕒 Connection not ready, setting up delayed initialization...');
    }

    let attempts = 0;

    const checkAndInit = () => {
      // Track attempts
      attempts++;

      // Check for connection in global.conn
      if (global.conn) {
        if (config.verbose) {
          console.log(`🔄 Connection now available after ${attempts} attempts, initializing connection keeper...`);
        }

        clearInterval(checkInterval);

        try {
          // Apply patches if requested
          if (config.applyPatches) {
            applyConnectionPatch(global.conn);
          }

          // Force reconnect if requested and it seems we have an established connection
          if (config.forceReconnect && global.conn.ws && 
            (global.conn.user || global.conn.ws.readyState === 1)) {
            log('Forcing initial reconnection as requested', 'INFO');
            // Use a slight delay to allow initialization to complete
            setTimeout(() => forceReconnect(global.conn), 3000);
          }

          // Initialize the connection keeper
          return initializeConnectionKeeper(global.conn);
        } catch (err) {
          log(`Error during delayed initialization: ${err.message}`, 'ERROR');
          return false;
        }
      }

      // Check if we've reached maximum attempts
      if (config.maxAttempts > 0 && attempts >= config.maxAttempts) {
        if (config.verbose) {
          console.log(`⚠️ Maximum attempts (${config.maxAttempts}) reached waiting for connection`);
        }
        clearInterval(checkInterval);
        return false;
      }

      // Log every 12 attempts (about 1 minute with default settings)
      if (config.verbose && attempts % 12 === 0) {
        console.log(`⏳ Still waiting for WhatsApp connection (attempt ${attempts})...`);
      }

      return false;
    };

    // Check at specified interval
    const checkInterval = setInterval(checkAndInit, config.pollInterval);

    // Store the interval in global space so it can be cancelled if needed
    global.connectionKeeperInterval = checkInterval;

    // Also try immediately in case conn is available
    return checkAndInit();
  }
}

module.exports = {
  initializeConnectionKeeper,
  forceReconnect,
  getConnectionState,
  applyConnectionPatch,
  connectionEvents,
  safeInitialize
};
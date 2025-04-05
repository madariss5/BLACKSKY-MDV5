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
 */

const { delay } = require('@adiwajshing/baileys');
const os = require('os');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Create a custom event emitter for connection events
const connectionEvents = new EventEmitter();
connectionEvents.setMaxListeners(20); // Increase max listeners to prevent memory leaks

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
  maxReconnectAttempts: 20,
  reconnectDelay: 2000, // Start with 2 seconds
  maxReconnectDelay: 60000, // Max 1 minute
  heartbeatInterval: null,
  connectionCheckInterval: null,
  lastHeartbeat: null,
  socketErrorCount: 0,
  maxSocketErrors: 5,
  socketErrorResetTime: 60000, // 1 minute
  lastSocketErrorTime: null,
};

/**
 * Initialize the connection keeper
 * @param {Object} conn - Baileys connection object
 */
function initializeConnectionKeeper(conn) {
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
      connectionState.reconnectDelay = 2000; // Reset reconnect delay
      
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
  }, 30000); // Check every 30 seconds
  
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
    
    // Check if we have user data (indicates successful auth)
    const hasUserData = !!conn.user;
    
    // Check if heartbeat is recent enough
    const hasRecentHeartbeat = connectionState.lastHeartbeat && 
      (Date.now() - connectionState.lastHeartbeat) < 60000; // Within last minute
    
    if (!isSocketConnected || !hasUserData) {
      log('Connection check failed - socket or user data issue', 'WARN');
      connectionState.isConnected = false;
      handleReconnection(conn);
      return;
    }
    
    if (!hasRecentHeartbeat) {
      log('No recent heartbeat detected, sending test ping', 'WARN');
      // Try to send a ping to see if connection is responsive
      await sendHeartbeat(conn);
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
  // Check if we've exceeded max attempts
  if (connectionState.reconnectAttempts >= connectionState.maxReconnectAttempts) {
    log('Maximum reconnection attempts reached', 'ERROR');
    connectionEvents.emit('reconnect.failed');
    return;
  }
  
  // Calculate delay with exponential backoff
  const delay = Math.min(
    connectionState.reconnectDelay * Math.pow(1.5, connectionState.reconnectAttempts),
    connectionState.maxReconnectDelay
  );
  
  connectionState.reconnectAttempts++;
  log(`Attempting reconnection ${connectionState.reconnectAttempts}/${connectionState.maxReconnectAttempts} in ${delay}ms`, 'INFO');
  
  // Wait for the calculated delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    // If global.reloadHandler exists, use it for reconnection
    if (global.reloadHandler) {
      log('Using global reloadHandler for reconnection', 'INFO');
      global.reloadHandler(true);
    } else {
      // Otherwise try to force socket reconnection
      log('Forcing socket reconnection', 'INFO');
      if (conn.ws) {
        conn.ws.close();
      }
      // Attempt to trigger Baileys' auto-reconnect
      conn.ev.emit('connection.update', {
        connection: 'close',
        lastDisconnect: {
          error: new Error('Forced reconnection by connection keeper')
        }
      });
    }
    
    log('Reconnection initiated', 'INFO');
  } catch (error) {
    log(`Reconnection error: ${error.message}`, 'ERROR');
    // Schedule another attempt
    setTimeout(() => handleReconnection(conn), 5000);
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
  }, 45000); // Every 45 seconds
  
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
 */
function applyConnectionPatch(conn) {
  // Save the original query function
  const originalQuery = conn.query.bind(conn);
  
  // Patch the query function with improved error handling
  conn.query = async (node, timeout = 10000) => {
    try {
      return await originalQuery(node, timeout);
    } catch (error) {
      // If it's a connection closed error, try to reconnect
      if (error.message && (
        error.message.includes('Connection closed') ||
        error.message.includes('connection closed') ||
        error.message.includes('timed out') ||
        error.message.includes('socket') ||
        error.message.includes('WebSocket')
      )) {
        log(`Query error: ${error.message}, attempting recovery`, 'WARN');
        if (connectionState.isConnected) {
          connectionState.isConnected = false;
          handleReconnection(conn);
        }
      }
      throw error;
    }
  };
  
  log('Applied connection patch for improved error handling', 'SUCCESS');
}

module.exports = {
  initializeConnectionKeeper,
  forceReconnect,
  getConnectionState,
  applyConnectionPatch,
  connectionEvents
};
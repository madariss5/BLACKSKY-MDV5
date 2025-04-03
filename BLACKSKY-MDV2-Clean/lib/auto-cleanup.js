/**
 * Auto-Cleanup Module
 * 
 * This module provides a centralized system for registering timers,
 * temporary resources, and other cleanup tasks to ensure proper
 * cleanup when the bot is shut down or resources need to be freed.
 */

// Registry of timers and resources
const registeredTimers = new Map();
const registeredResources = new Map();

/**
 * Initialize the auto-cleanup system
 */
function initAutoCleanup() {
  console.log('[AUTO-CLEANUP] Initializing auto-cleanup system');
  
  // Make the system globally available
  global.autoCleanup = {
    registerTimer,
    unregisterTimer,
    registerResource,
    unregisterResource,
    cleanupAll,
    getRegisteredTimers: () => Array.from(registeredTimers.keys()),
    getRegisteredResources: () => Array.from(registeredResources.keys())
  };
  
  // Register process exit handler
  process.on('exit', () => {
    console.log('[AUTO-CLEANUP] Process exit detected, cleaning up resources');
    cleanupAll();
  });
  
  // Register SIGINT handler (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('[AUTO-CLEANUP] SIGINT detected, cleaning up resources');
    cleanupAll();
    process.exit(0);
  });
  
  // Register uncaught exception handler
  process.on('uncaughtException', (err) => {
    console.error('[AUTO-CLEANUP] Uncaught exception:', err);
    console.log('[AUTO-CLEANUP] Cleaning up resources due to uncaught exception');
    cleanupAll();
    // Let the process exit normally to allow other handlers to run
  });
  
  return true;
}

/**
 * Register a timer for automatic cleanup
 * @param {Object} timer - The timer object (from setTimeout or setInterval)
 * @param {string} description - A description of the timer
 * @returns {boolean} - Whether the registration was successful
 */
function registerTimer(timer, description = 'unknown') {
  if (!timer) return false;
  
  const timerId = getTimerId(timer);
  registeredTimers.set(timerId, {
    timer,
    description,
    createdAt: Date.now()
  });
  
  console.log(`[AUTO-CLEANUP] Registered timer: ${description} (ID: ${timerId})`);
  return true;
}

/**
 * Unregister a timer
 * @param {Object} timer - The timer object to unregister
 * @returns {boolean} - Whether the unregistration was successful
 */
function unregisterTimer(timer) {
  if (!timer) return false;
  
  const timerId = getTimerId(timer);
  if (registeredTimers.has(timerId)) {
    registeredTimers.delete(timerId);
    console.log(`[AUTO-CLEANUP] Unregistered timer: ${timerId}`);
    return true;
  }
  
  return false;
}

/**
 * Register a resource for automatic cleanup
 * @param {Object} resource - The resource object
 * @param {string} description - A description of the resource
 * @param {Function} cleanupFn - A function to call to clean up the resource
 * @returns {boolean} - Whether the registration was successful
 */
function registerResource(resource, description = 'unknown', cleanupFn) {
  if (!resource || typeof cleanupFn !== 'function') return false;
  
  const resourceId = getResourceId(resource);
  registeredResources.set(resourceId, {
    resource,
    description,
    cleanupFn,
    createdAt: Date.now()
  });
  
  console.log(`[AUTO-CLEANUP] Registered resource: ${description} (ID: ${resourceId})`);
  return true;
}

/**
 * Unregister a resource
 * @param {Object} resource - The resource object to unregister
 * @returns {boolean} - Whether the unregistration was successful
 */
function unregisterResource(resource) {
  if (!resource) return false;
  
  const resourceId = getResourceId(resource);
  if (registeredResources.has(resourceId)) {
    registeredResources.delete(resourceId);
    console.log(`[AUTO-CLEANUP] Unregistered resource: ${resourceId}`);
    return true;
  }
  
  return false;
}

/**
 * Clean up all registered timers and resources
 */
function cleanupAll() {
  // Clean up timers
  console.log(`[AUTO-CLEANUP] Cleaning up ${registeredTimers.size} timers`);
  for (const [timerId, timerInfo] of registeredTimers.entries()) {
    try {
      clearTimeout(timerInfo.timer);
      clearInterval(timerInfo.timer);
      console.log(`[AUTO-CLEANUP] Cleared timer: ${timerInfo.description}`);
    } catch (error) {
      console.error(`[AUTO-CLEANUP] Error clearing timer ${timerId}:`, error.message);
    }
  }
  registeredTimers.clear();
  
  // Clean up resources
  console.log(`[AUTO-CLEANUP] Cleaning up ${registeredResources.size} resources`);
  for (const [resourceId, resourceInfo] of registeredResources.entries()) {
    try {
      resourceInfo.cleanupFn(resourceInfo.resource);
      console.log(`[AUTO-CLEANUP] Cleaned up resource: ${resourceInfo.description}`);
    } catch (error) {
      console.error(`[AUTO-CLEANUP] Error cleaning up resource ${resourceId}:`, error.message);
    }
  }
  registeredResources.clear();
  
  return true;
}

/**
 * Get a unique ID for a timer
 * @param {Object} timer - The timer object
 * @returns {string} - A unique ID for the timer
 */
function getTimerId(timer) {
  // Use the timer's internal ID if available, or a random string if not
  return (timer._idleTimeout || timer._repeat) ? 
    `timer_${timer._idleTimeout || timer._repeat}_${Date.now()}` : 
    `timer_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get a unique ID for a resource
 * @param {Object} resource - The resource object
 * @returns {string} - A unique ID for the resource
 */
function getResourceId(resource) {
  // Use object's constructor name and a random string
  const constructorName = resource.constructor ? resource.constructor.name : 'Unknown';
  return `resource_${constructorName}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export the module
module.exports = {
  initAutoCleanup,
  registerTimer,
  unregisterTimer,
  registerResource,
  unregisterResource,
  cleanupAll
};
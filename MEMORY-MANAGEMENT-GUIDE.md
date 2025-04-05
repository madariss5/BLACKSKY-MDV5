# BLACKSKY-MD Memory Management Guide

This guide explains how memory management works in BLACKSKY-MD to prevent Heroku R15 (memory quota exceeded) errors.

## Understanding Heroku Memory Constraints

Heroku Eco and Basic dynos have limited memory allocations:
- **Free dynos**: 512MB memory limit (deprecated, no longer available)
- **Eco dynos**: 512MB memory limit
- **Basic dynos**: 512MB memory limit
- **Standard-1X dynos**: 1GB memory limit
- **Standard-2X dynos**: 2GB memory limit

When your application exceeds its memory quota (often reaching over 200% of the allocation), Heroku terminates the process with an R15 error and restarts your dyno.

## Memory Optimization System

BLACKSKY-MD includes a sophisticated memory management system to prevent these crashes:

### Features

1. **Automatic Memory Monitoring**: 
   - Checks memory usage every 60 seconds
   - Logs warnings when memory usage exceeds 70%
   - Triggers cleanup actions at specific thresholds

2. **Standard Cleanup (70% threshold)**:
   - Clears non-essential module caches
   - Removes old messages from chat history
   - Optimizes internal data structures

3. **Emergency Cleanup (85% threshold)**:
   - Aggressively clears all non-essential caches
   - Forces garbage collection
   - Temporarily disables certain features to reduce memory pressure

4. **Memory Usage Reporting**:
   - Memory statistics available via `/health` endpoint
   - Includes heap usage, system memory, and percentage metrics

### How to Enable Memory Optimization

Memory optimization is enabled by setting the environment variable:
```
ENABLE_MEMORY_OPTIMIZATION=true
```

This can be set in your Heroku dashboard under Settings > Config Vars.

## Memory Usage Guidelines

For optimal performance:

1. **Avoid excessive plugins**: Each plugin loaded increases memory usage. Only enable plugins you actually need.

2. **Limit connected devices**: More connected devices means more memory usage. For Eco dynos, 1-2 devices is recommended.

3. **Use session backup**: Enable PostgreSQL database for session backup to prevent session loss during restarts.

4. **Monitor usage patterns**: If you consistently see memory errors at certain times, consider scheduling periodic restarts before peak usage.

5. **Consider upgrading**: If you frequently experience R15 errors even with optimization enabled, consider upgrading to a Standard-1X or Standard-2X dyno.

## Health Check Endpoint

The bot exposes a health check endpoint at `/health` that returns detailed memory information:

```json
{
  "status": "ok",
  "timestamp": "2025-04-05T17:00:46.130Z",
  "uptime": 25.448,
  "memory": {
    "raw": { /* Raw memory values in bytes */ },
    "formatted": {
      "heapUsed": 26,
      "heapTotal": 42,
      "rss": 121,
      "external": 3,
      "arrayBuffers": 0,
      "systemTotal": 64313,
      "systemFree": 13601,
      "systemUsed": 50712
    },
    "percentages": {
      "heapUsage": 63,
      "systemUsage": 79
    }
  },
  "memoryOptimizationEnabled": true,
  "databaseConnected": true
}
```

## Troubleshooting Memory Issues

If you still experience memory problems:

1. **Check logs**: Look for memory warnings in your Heroku logs:
   ```
   heroku logs --tail
   ```

2. **Disable heavy plugins**: Some plugins are particularly memory-intensive. Disable them if you're experiencing issues.

3. **Verify optimization settings**: Ensure `ENABLE_MEMORY_OPTIMIZATION=true` is set in your environment variables.

4. **Schedule restarts**: You can set up a scheduler to restart your dyno periodically:
   ```
   heroku addons:create scheduler:standard
   ```
   Then configure it to run `heroku restart` at suitable intervals.

5. **Monitor with metrics**: Consider adding Heroku Metrics for detailed performance monitoring.

## Technical Implementation

The memory management system consists of:

1. **advanced-memory-manager.js**: Core memory management functionality
   - Located in the lib/ directory
   - Provides monitoring, caching, and cleanup operations
   - Exports interface functions for memory management

2. **Basic Memory Manager Fallback**: Ensures memory management is always available
   - Implemented directly in heroku-bot-starter.js
   - Provides core features when advanced manager fails
   - Handles graceful degradation

3. **Automated Monitoring**: Regular checks integrated with the bot
   - Configured in heroku-bot-starter.js
   - Runs on intervals defined by MEMORY_CHECK_INTERVAL
   - Triggers actions based on memory thresholds

## Advanced Configuration

For power users, additional memory optimization can be configured by setting these optional environment variables:

- `MEMORY_WARNING_THRESHOLD`: Percentage at which to log warnings (default: 70)
- `MEMORY_CLEANUP_THRESHOLD`: Percentage at which to run standard cleanup (default: 70)
- `MEMORY_EMERGENCY_THRESHOLD`: Percentage at which to run emergency cleanup (default: 85)
- `MEMORY_CHECK_INTERVAL`: How often to check memory usage in milliseconds (default: 60000)

## Summary

The memory management system in BLACKSKY-MD is designed to prevent Heroku R15 errors by proactively monitoring memory usage and performing cleanup operations when needed. By enabling this system and following the guidelines in this document, you can enjoy a more stable and reliable bot operation on Heroku.

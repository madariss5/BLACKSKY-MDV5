# BLACKSKY-MD Premium - Heroku Memory Optimization Guide

This document provides a comprehensive overview of the memory optimization enhancements made to BLACKSKY-MD Premium for Heroku deployment.

## Memory Issues Fixed

1. **Prevented R15 Memory Quota Exceeded Errors**
   - Fixed excessive memory growth that caused Heroku to terminate the process
   - Addressed memory leaks in WhatsApp session management
   - Added monitoring to detect and prevent memory spikes

2. **Fixed Runtime Memory Management**
   - Implemented proper memory usage statistics reporting
   - Added cascading fallback system for robust operation
   - Fixed memory function integration issues

## Memory Management Architecture

### Multiple Fallback Layers

The system now implements a multi-layered memory management approach:

1. **Advanced Memory Manager** - Primary system that provides comprehensive monitoring
2. **Basic Memory Manager** - Fallback system when the advanced system encounters issues
3. **Direct Function Access** - Third level of fallback using direct module imports
4. **Health Endpoint Fallback** - Final safety mechanism for server stability

### Memory Monitoring Process

1. **Memory Usage Detection**
   - Uses Node.js `process.memoryUsage()` to track heap usage
   - Monitors system memory via the OS module
   - Reports memory metrics via health endpoint (/health)

2. **Progressive Cleanup Strategy**
   - Standard cleanup at 70% memory usage threshold
     - Clears module caches for non-essential modules
     - Performs limited garbage collection
   
   - Emergency cleanup at 85% memory usage threshold
     - Aggressively clears module caches
     - Reduces chat history memory usage
     - Attempts multiple garbage collection cycles
     - Cleans up event listeners that might be leaking

### Fault Tolerance Improvements

1. **Function Availability Verification**
   - Checks if required functions exist before calling them
   - Dynamically adds missing functions when needed
   - Safely handles missing or erroring functions

2. **Proper Error Handling**
   - Comprehensive try/catch blocks around all memory operations
   - Detailed error logging for troubleshooting
   - Graceful degradation to simpler memory handling

## Setup and Configuration

To enable memory optimization for Heroku deployment:

1. Set the following environment variables:
   ```
   ENABLE_MEMORY_OPTIMIZATION=true
   ```

2. Monitor memory usage with the health endpoint:
   ```
   curl https://your-app-name.herokuapp.com/health | jq
   ```

3. The health endpoint returns detailed memory statistics:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-04-05T17:13:32.189Z",
     "uptime": 4.172818665,
     "memory": {
       "raw": {
         "rss": 112119808,
         "heapTotal": 44113920,
         "heapUsed": 27160048,
         "external": 3504748,
         "arrayBuffers": 77927
       },
       "formatted": {
         "heapUsed": 26,
         "heapTotal": 42,
         "rss": 107,
         "external": 3,
         "arrayBuffers": 0,
         "systemTotal": 64313,
         "systemFree": 14752,
         "systemUsed": 49561
       },
       "percentages": {
         "heapUsage": 62,
         "systemUsage": 77
       }
     },
     "memoryOptimizationEnabled": true,
     "databaseConnected": true
   }
   ```

## Recommendations for Optimal Performance

1. **Use a Proper Heroku Dyno Size**
   - Standard-1X (512MB) is the minimum recommended
   - Standard-2X (1024MB) provides better stability for larger groups

2. **Enable Database Session Backups**
   - Set `ENABLE_SESSION_BACKUP=true` 
   - This prevents memory issues during reconnection

3. **Enable Connection Health Monitoring**
   - Set `ENABLE_HEALTH_CHECK=true`
   - Keep your app awake with a service like UptimeRobot

4. **Use Heroku Metrics Dashboard**
   - Monitor your dyno's memory usage
   - Set up alerts for consistent high memory usage

## Troubleshooting

If you encounter memory issues (R15 errors) even with optimization enabled:

1. Check Heroku logs:
   ```
   heroku logs --tail
   ```

2. Look for memory threshold warnings:
   ```
   ⚠️ Memory usage high: 90.0% (220 MB)
   ```

3. Check if cleanup is working:
   ```
   🧹 Running standard memory cleanup...
   ```

4. Verify emergency cleanup trigger:
   ```
   🚨 Memory usage critical! Running emergency cleanup...
   ```

With these optimizations, BLACKSKY-MD Premium should run stably on Heroku without encountering R15 memory quota exceeded errors.
# Memory Management Fixes for BlackSky MD Bot

## Issue Description
The bot was experiencing R15 memory errors on Heroku where it was consuming excessive memory (over 200% of allocation, approximately 1123MB), causing Heroku to terminate the process with `SIGKILL`.

## Root Cause
1. The memory manager in `lib/advanced-memory-manager.js` was returning memory usage information with different property names than what the code in `heroku-bot-starter.js` was trying to access.
2. Specifically, `getMemoryUsage()` returned an object with:
   - `raw`: Raw memory usage data
   - `formatted`: Memory usage in MB
   - `percentages`: Contains `heapUsage` and `systemUsage` percentages
   - `time`: Timestamp

3. But the code was trying to access:
   - `memoryInfo.usedPercentage`
   - `memoryInfo.used`
   
This mismatch resulted in unhandled memory pressure and eventually led to crashes.

## Applied Fixes
1. Updated the memory monitoring code in `heroku-bot-starter.js` to use the correct properties:
   - Changed `memoryInfo.usedPercentage` to `memoryInfo.percentages.heapUsage`
   - Changed `memoryInfo.used` calculations to use `memoryInfo.formatted.heapUsed`
   
2. Corrected the references in multiple locations:
   - Main memory monitoring interval
   - Connection watcher memory checks
   - Restart handler memory checks

## Verification
The fix ensures that:
1. Memory alerts will properly trigger at 70% heap usage
2. Memory cleanup will run at 70% heap usage
3. Emergency cleanup will run at 85% heap usage
4. WhatsApp message history will be pruned when memory is high
5. Forced garbage collection will occur when memory is critical

## Environment Variables
The following environment variables control the memory optimization behavior:
- `ENABLE_MEMORY_OPTIMIZATION`: Set to "true" to enable memory optimization (default: true)
- `MEMORY_CHECK_INTERVAL`: Milliseconds between memory checks (default: 30000 - 30 seconds)
- `MEMORY_WARNING_THRESHOLD`: Percentage at which to trigger standard cleanup (default: 70)
- `MEMORY_CRITICAL_THRESHOLD`: Percentage at which to trigger emergency cleanup (default: 85)

## Recommendations for Deployment
1. Deploy on Heroku Basic or Eco dynos with at least 512MB RAM
2. Ensure PostgreSQL addon is properly configured for session persistence
3. Keep `ENABLE_MEMORY_OPTIMIZATION` set to true
4. Monitor memory usage via Heroku logs
5. If memory issues persist after this fix, consider:
   - Reducing the number of active plugins
   - Increasing the frequency of memory checks (lower `MEMORY_CHECK_INTERVAL`)
   - Lowering thresholds for cleanup operations
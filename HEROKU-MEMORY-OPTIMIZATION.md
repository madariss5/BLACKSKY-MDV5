# BLACKSKY-MD Premium - Heroku Memory Optimization Guide

This document describes the memory optimization features implemented to fix R15 memory quota exceeded errors on Heroku.

## Problem: Memory Quota Exceeded (R15) Error

The bot was experiencing memory quota exceeded errors (R15) on Heroku, where memory usage reached 219.5% of allocation (1123MB), causing Heroku to terminate the process with SIGKILL.

## Solution: Advanced Memory Management System

The BLACKSKY-MD Premium bot now includes a comprehensive memory management system that prevents R15 errors through proactive monitoring and optimization.

### Key Optimizations Implemented:

1. **Integrated Advanced Memory Manager**
   - Monitors memory usage in real-time
   - Provides early warning at 70% memory usage
   - Triggers cleanup routines at critical thresholds (85%)
   - Prevents memory leaks through proactive management

2. **WhatsApp-Specific Memory Optimizations**
   - Automatically cleans chat message history when memory is high
   - Limits stored messages per chat to prevent excessive memory usage
   - Optimizes connection handling to reduce memory footprint

3. **Automated Connection Monitoring**
   - Connection watcher detects offline states and memory issues
   - Triggers reconnection when needed
   - Performs targeted cleanup of memory-intensive components

4. **Enhanced Graceful Shutdown**
   - Performs memory cleanup before exit
   - Ensures clean session backup to PostgreSQL
   - Prevents data loss during Heroku dyno cycling

5. **Periodic Memory Monitoring**
   - Regular memory usage checks and logging
   - Automated cleanup routines based on usage thresholds
   - Garbage collection forcing when necessary

## Environment Configuration

To enable memory optimization features, set:

```
ENABLE_MEMORY_OPTIMIZATION=true
```

This is enabled by default in the latest update.

## Recommended Heroku Configuration

For optimal performance:

1. Use Heroku Basic or Eco plan for sufficient memory allocation
2. Add PostgreSQL add-on for session persistence
3. Configure automatic dyno restart using Heroku Scheduler
4. Set `WEB_CONCURRENCY=1` to prevent multiple processes competing for memory

## Monitoring Memory Usage

The health check endpoint (`/health`) now includes detailed memory usage statistics that can be monitored through the Heroku logs or using a third-party monitoring tool.

## Memory Troubleshooting

If you still experience memory issues:

1. Check Heroku logs for "Memory usage high" warnings
2. Verify the memory manager is showing as enabled in logs
3. Consider upgrading to a higher Heroku plan with more memory
4. Disable memory-intensive plugins if necessary

---

These optimizations should resolve R15 errors and provide stable 24/7 operation on Heroku dyno hosting.

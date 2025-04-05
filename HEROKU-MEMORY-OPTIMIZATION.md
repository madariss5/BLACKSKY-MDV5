# Heroku Memory Optimization Guide for BLACKSKY-MD Premium

This guide outlines best practices for maintaining optimal memory usage on Heroku to prevent R15 memory errors and ensure 24/7 bot operation.

## Understanding Heroku Memory Limits

Heroku's free and hobby dynos have the following memory restrictions:

- **Free Tier**: 512MB memory limit
- **Hobby Tier**: 512MB memory limit
- **Standard-1X**: 1GB memory limit
- **Standard-2X**: 2GB memory limit

When a dyno exceeds its memory allocation, Heroku issues an R15 error and terminates the process with SIGKILL, which can cause data loss and connection instability.

## Key Memory Optimization Features

BLACKSKY-MD Premium includes a robust memory management system that helps prevent R15 errors:

### 1. Automatic Memory Cleanup

The bot automatically monitors memory usage and performs cleanup at two thresholds:

- **Regular Cleanup (70%)**: Clears non-essential caches and optimizes memory usage
- **Emergency Cleanup (85%)**: More aggressive cleanup to prevent imminent crashes

### 2. Memory Usage Monitoring via Health Endpoint

You can monitor your bot's memory usage in real-time via the health endpoint:

```
https://your-app-name.herokuapp.com/health
```

This endpoint provides detailed memory metrics including:
- Current heap usage percentage
- Current system memory usage percentage
- Raw memory values in MB

### 3. Environment Variables

Control memory optimization behavior with these environment variables:

- `ENABLE_MEMORY_OPTIMIZATION=true` - Enables or disables memory optimization (default: true)
- `MEMORY_CLEANUP_THRESHOLD=70` - Sets the percentage threshold for regular cleanup (default: 70)
- `MEMORY_EMERGENCY_THRESHOLD=85` - Sets the percentage threshold for emergency cleanup (default: 85)
- `MEMORY_CHECK_INTERVAL=60000` - Sets the interval in milliseconds for memory checks (default: 60000 - 1 minute)

## Best Practices for Managing Memory Usage

### 1. Limit Group Participation

Each WhatsApp group the bot participates in increases memory usage. For optimal performance:

- **Free/Hobby Dyno**: Limit to 50 active groups
- **Standard-1X**: Limit to 150 active groups
- **Standard-2X**: Limit to 300 active groups

### 2. Optimize Plugin Usage

Disable unused plugins to reduce memory consumption:

```javascript
// In your config.js file, disable unused plugins
global.disabledPlugins = [
  'plugin-heavy-1',
  'plugin-heavy-2',
  // Add more plugins to disable
]
```

### 3. Optimize Media Processing

Media processing (images, videos, stickers) consumes significant memory:

- Use the built-in media optimization setting to automatically resize images before processing
- Consider disabling auto-sticker features in large groups
- Limit video processing features if experiencing memory pressure

```javascript
// In your config.js file
global.autoOptimizeMedia = true     // Enable media optimization
global.maxMediaSizeMB = 15          // Limit media size to process
```

### 4. Regular Maintenance

Perform these maintenance tasks regularly:

- Clear temporary files folder via command: `.cleartmp`
- Restart bot weekly if possible to refresh memory: `.restart`
- Monitor memory usage via health endpoint
- Review logs for any memory-related warnings

### 5. Use Database Caching Wisely

The PostgreSQL database is used for session persistence. To optimize database usage:

- Set appropriate backup intervals in config.js
- Use indexed queries for database operations
- Clear old database entries periodically

## Troubleshooting Memory Issues

If you continue to experience memory-related crashes:

1. Check the health endpoint for memory usage patterns
2. Look for specific plugins that might be causing memory spikes
3. Reduce the number of active groups
4. Consider upgrading to a higher dyno tier with more memory
5. Adjust cleanup thresholds for more aggressive memory management

## Conclusion

By following these best practices and utilizing the built-in memory optimization features, your BLACKSKY-MD Premium bot should maintain stable operation on Heroku without encountering R15 memory errors.

For more advanced memory optimization configurations, refer to the advanced memory manager documentation.

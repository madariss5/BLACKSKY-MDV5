/**
 * BLACKSKY-MD Premium - Response Cache System
 * Improves response times by caching common command responses
 */

class ResponseCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 60 * 1000; // Default 1 minute TTL
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0
    };
  }

  /**
   * Create a unique key for the command and parameters
   * @param {string} command - Command name
   * @param {Array} args - Command arguments
   * @param {string} chat - Chat ID
   * @returns {string} - Cache key
   */
  createKey(command, args = [], chat = '') {
    return `${command}:${args.join(',')}:${chat}`;
  }

  /**
   * Get a cached response
   * @param {string} command - Command name
   * @param {Array} args - Command arguments 
   * @param {string} chat - Chat ID
   * @returns {object|null} - Cached response or null if not found
   */
  get(command, args = [], chat = '') {
    const key = this.createKey(command, args, chat);
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.size--;
      this.stats.misses++;
      return null;
    }
    
    // Update access time and hit count
    item.lastAccessed = Date.now();
    item.hits++;
    this.stats.hits++;
    
    return item.value;
  }

  /**
   * Store a response in the cache
   * @param {string} command - Command name
   * @param {Array} args - Command arguments
   * @param {string} chat - Chat ID
   * @param {object} value - Response to cache
   * @param {number} ttl - Custom TTL in ms (optional)
   */
  set(command, args = [], chat = '', value, ttl = this.ttl) {
    // Don't cache null/undefined values
    if (value === null || value === undefined) return;
    
    const key = this.createKey(command, args, chat);
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      value,
      created: Date.now(),
      expiry: Date.now() + ttl,
      lastAccessed: Date.now(),
      hits: 0
    });
    
    if (!this.cache.has(key)) {
      this.stats.size++;
    }
  }

  /**
   * Remove least recently used item from cache
   */
  evictLRU() {
    let oldest = Infinity;
    let oldestKey = null;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldest) {
        oldest = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.size--;
    }
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%' 
        : '0%'
    };
  }
}

module.exports = ResponseCache;
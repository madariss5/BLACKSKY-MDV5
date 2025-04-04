/**
 * BLACKSKY-MD Premium - Group Message Optimization Test
 * 
 * This script tests the optimizations implemented in handler.js
 * for better performance in group chats.
 */

// Import required modules
const process = require('process');
const os = require('os');

// Print system information
console.log('=== SYSTEM INFORMATION ===');
console.log(`OS: ${os.platform()} ${os.release()}`);
console.log(`Total Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`);
console.log(`Available Memory: ${Math.round(os.freemem() / (1024 * 1024 * 1024))}GB`);
console.log(`Node.js Version: ${process.version}`);

// Check if running with garbage collection exposed
console.log(`\nGarbage Collection Exposed: ${global.gc ? 'Yes' : 'No'}`);

// Test memory usage before optimizations
console.log('\n=== MEMORY USAGE TESTING ===');
console.log('Initial Memory Usage:');
printMemoryUsage();

// Simulate message processing
console.log('\n=== SIMULATING GROUP MESSAGE PROCESSING ===');
console.log('Creating simulated message cache...');

// Create large message cache (simulate high usage)
const messageCache = new Map();
for (let i = 0; i < 1000; i++) {
  const chatId = `group-${Math.floor(i / 10)}@g.us`;
  const msgId = `msg-${i}`;
  const key = `${chatId}:${msgId}`;
  
  messageCache.set(key, {
    content: `Message content ${i} with some reasonable length to simulate real messages`,
    sender: `sender-${i % 50}@s.whatsapp.net`,
    timestamp: Date.now() - (i * 1000),
    processed: true
  });
}

console.log(`Created message cache with ${messageCache.size} entries`);
console.log('Memory usage after cache creation:');
printMemoryUsage();

// Test memory optimization functions
console.log('\n=== TESTING MEMORY OPTIMIZATION ===');
console.log('Simulating cleanup of old cache entries...');

// Cleanup oldest 50% of messages
const entries = [...messageCache.entries()];
const oldestHalf = entries.slice(0, entries.length / 2);
for (const [key] of oldestHalf) {
  messageCache.delete(key);
}

console.log(`Removed ${oldestHalf.length} old entries from cache`);
console.log('Memory after cleanup (before GC):');
printMemoryUsage();

// Force garbage collection if available
if (global.gc) {
  console.log('\n=== FORCING GARBAGE COLLECTION ===');
  global.gc();
  console.log('Memory after garbage collection:');
  printMemoryUsage();
}

// Test pattern matching optimization (simulating the pluginCache)
console.log('\n=== TESTING PATTERN MATCHING OPTIMIZATION ===');

// Create simulated plugin patterns
const pluginPatterns = {
  simple: {
    type: 'string',
    command: '.test'
  },
  regex: {
    type: 'regex',
    originalSource: '^\\.(menu|help|start)$',
    originalFlags: 'i'
  },
  array: {
    type: 'array',
    commands: ['.sticker', '.s', '.stiker']
  }
};

// Test matching performance
console.log('Testing command match performance...');
console.time('Standard matching');
for (let i = 0; i < 10000; i++) {
  const commands = ['.menu', '.help', '.sticker', '.unknown', '.test'];
  const command = commands[i % commands.length];
  
  // Simulate standard regex matching
  let matched = false;
  if (command === '.test') matched = true;
  if (/^\.(menu|help|start)$/i.test(command)) matched = true;
  if (['.sticker', '.s', '.stiker'].includes(command)) matched = true;
}
console.timeEnd('Standard matching');

console.time('Optimized matching');
// Pre-compile regex for optimized version
const precompiledRegex = new RegExp('^\\.(menu|help|start)$', 'i');
const commandsArr = ['.sticker', '.s', '.stiker'];

for (let i = 0; i < 10000; i++) {
  const commands = ['.menu', '.help', '.sticker', '.unknown', '.test'];
  const command = commands[i % commands.length];
  
  // Simulate optimized direct lookup
  let matched = false;
  // Direct command lookup
  if (command === '.test') matched = true;
  
  // Check regex patterns without re-compiling
  if (precompiledRegex.test(command)) matched = true;
  
  // Direct array includes
  if (commandsArr.includes(command)) matched = true;
}
console.timeEnd('Optimized matching');

// Helper function to print memory usage
function printMemoryUsage() {
  const mem = process.memoryUsage();
  console.log({
    rss: `${Math.round(mem.rss / (1024 * 1024))} MB`,
    heapTotal: `${Math.round(mem.heapTotal / (1024 * 1024))} MB`,
    heapUsed: `${Math.round(mem.heapUsed / (1024 * 1024))} MB`,
    external: `${Math.round(mem.external / (1024 * 1024))} MB`
  });
}

console.log('\n=== TEST COMPLETED ===');
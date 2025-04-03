/**
 * Termux Environment Helper for BLACKSKY-MD
 * 
 * This script provides utilities for detecting Termux environments
 * and loading appropriate optimizations and polyfills.
 * 
 * This is designed to complement the existing Termux detection in index.js
 * and provides additional functionality for Termux environments.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

// Detect if running in Termux environment
function isTermuxEnvironment() {
  // Check for explicit environment variable
  if (process.env.TERMUX === 'true') {
    return true;
  }
  
  // Check platform - Android devices run Linux but with arm architecture
  const isAndroid = os.platform() === 'android';
  
  if (isAndroid) {
    return true;
  }
  
  // Check for Termux-specific paths
  const termuxPaths = [
    '/data/data/com.termux',
    '/data/data/com.termux/files/usr',
    '/data/data/com.termux/files/home'
  ];
  
  for (const tPath of termuxPaths) {
    if (fs.existsSync(tPath)) {
      return true;
    }
  }
  
  // Check CPU architecture - most Termux devices are arm or arm64
  const arch = os.arch();
  const isArmArch = arch === 'arm' || arch === 'arm64';
  
  // Additional heuristic: memory limit often lower on mobile devices
  const totalMem = os.totalmem();
  const isLowMem = totalMem < 4 * 1024 * 1024 * 1024; // 4GB
  
  // Combine multiple factors for more accurate detection
  if (isArmArch && isLowMem && os.platform() === 'linux') {
    // High probability of being on Termux
    return true;
  }
  
  return false;
}

/**
 * Load appropriate Sharp implementation (native or polyfill)
 * This function is compatible with the existing Sharp loading code in index.js
 * 
 * @returns {Object} The Sharp or Sharp compatibility implementation
 */
function loadSharpImplementation() {
  if (isTermuxEnvironment()) {
    console.log('📱 Running in Termux environment');
    
    try {
      // Try to use native Sharp first
      const sharpNative = require('sharp');
      console.log('✅ Native Sharp module loaded successfully in Termux');
      return sharpNative;
    } catch (err) {
      // Fall back to compatibility layer
      console.log('⚠️ Native Sharp not available, using compatibility layer');
      try {
        const sharpCompat = require('./sharp-compat.js');
        console.log('✅ Sharp compatibility layer loaded successfully');
        return sharpCompat;
      } catch (compatErr) {
        console.error('Failed to load Sharp compatibility layer:', compatErr);
        throw new Error('Could not load Sharp or its compatibility layer');
      }
    }
  } else {
    // Not in Termux, use native Sharp
    try {
      const sharpNative = require('sharp');
      return sharpNative;
    } catch (err) {
      // Fall back to compatibility layer even outside Termux
      console.error('Failed to load Sharp, falling back to compatibility layer:', err.message);
      try {
        const sharpCompat = require('./sharp-compat.js');
        return sharpCompat;
      } catch (compatErr) {
        console.error('Failed to load Sharp compatibility layer:', compatErr);
        throw new Error('Could not load Sharp or its compatibility layer');
      }
    }
  }
}

/**
 * Apply Termux-specific optimizations for better performance
 * This includes memory management, directory creation, and GC scheduling
 * 
 * @returns {Boolean} True if optimizations were applied
 */
function applyTermuxOptimizations() {
  if (!isTermuxEnvironment()) {
    return false;
  }
  
  console.log('🔧 Applying Termux-specific optimizations...');
  
  // Set memory optimization for Node.js
  if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('--max-old-space-size')) {
    process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=1024`;
    console.log('✅ Memory limit optimized for Termux');
  }
  
  // Create necessary directories if they don't exist
  const requiredDirs = ['tmp', 'sessions', 'media'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (err) {
        console.error(`Failed to create directory ${dir}:`, err.message);
      }
    }
  }
  
  // Force garbage collection periodically to manage memory
  setInterval(() => {
    if (global.gc) {
      try {
        global.gc();
      } catch (err) {
        // Ignore errors in garbage collection
      }
    }
  }, 60000); // Run every minute
  
  return true;
}

/**
 * Fix common Termux issues with the node-gyp module and native dependencies
 * This should be called when initializing the application in a Termux environment
 * 
 * @returns {Boolean} True if fixes were applied
 */
function fixTermuxNativeModules() {
  if (!isTermuxEnvironment()) {
    return false;
  }
  
  console.log('🧰 Checking and fixing Termux native modules...');
  
  try {
    // Ensure Jimp is installed (needed for Sharp compatibility)
    try {
      require.resolve('jimp');
      console.log('✅ Jimp is already installed');
    } catch (e) {
      console.log('⚠️ Jimp not found, attempting to install...');
      // Use a safer way to install via child_process
      const { execSync } = require('child_process');
      execSync('npm install jimp --no-save', { stdio: 'inherit' });
    }
    
    // Check if sharp-compat.js exists
    if (!fs.existsSync('./sharp-compat.js')) {
      console.log('⚠️ Sharp compatibility file not found!');
      console.log('Please ensure sharp-compat.js is in the root directory.');
    } else {
      console.log('✅ Sharp compatibility file found');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error fixing Termux native modules:', err);
    return false;
  }
}

/**
 * Check and optimize image processing capabilities
 * 
 * @returns {Object} Information about available image processing capabilities
 */
function checkImageProcessingCapabilities() {
  const capabilities = {
    sharp: false,
    jimp: false,
    optimized: false,
    recommendations: []
  };
  
  try {
    require.resolve('sharp');
    capabilities.sharp = true;
  } catch (e) {
    capabilities.recommendations.push('Install Sharp or use compatibility layer');
  }
  
  try {
    require.resolve('jimp');
    capabilities.jimp = true;
  } catch (e) {
    capabilities.recommendations.push('Install Jimp for basic image processing');
  }
  
  if (isTermuxEnvironment()) {
    if (capabilities.jimp) {
      capabilities.optimized = true;
      console.log('✅ Termux image processing is optimized (using Jimp)');
    } else {
      console.log('⚠️ No optimized image processing libraries available');
      capabilities.recommendations.push('Run npm install jimp');
    }
  } else if (capabilities.sharp) {
    capabilities.optimized = true;
  }
  
  return capabilities;
}

// Export utilities
module.exports = {
  isTermuxEnvironment,
  loadSharpImplementation,
  applyTermuxOptimizations,
  fixTermuxNativeModules,
  checkImageProcessingCapabilities
};
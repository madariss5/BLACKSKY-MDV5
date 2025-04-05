/**
 * BLACKSKY-MD Premium - Sharp Compatibility Module Loader
 * 
 * This module handles loading the appropriate sharp implementation based on the environment.
 * In Termux, it will use our Jimp-based compatibility layer, while in standard environments
 * it will try to use the native Sharp module first and fall back to the compatibility layer if needed.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

// Detect if we're running in Termux
const isTermux = os.platform() === 'android' || process.env.TERMUX === 'true';

// Function to check if a module exists
function moduleExists(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}

// Try to load Sharp or fallback to compatibility layer
let sharpModule;

function loadSharp() {
  // In Termux, always use the compatibility layer
  if (isTermux) {
    console.log('📱 Running in Termux environment, using Jimp-based Sharp compatibility layer');
    
    // Try to load our compatibility module
    if (moduleExists('./sharp-compat.js')) {
      return require('./sharp-compat.js');
    } else if (moduleExists('./sharp-simple-compat.js')) {
      return require('./sharp-simple-compat.js');
    } else {
      console.warn('⚠️ No Sharp compatibility module found, creating minimal stub');
      // Create a minimal stub with the most essential functions
      return createMinimalStub();
    }
  }
  
  // In standard environments, try native Sharp first
  try {
    // First attempt to load native Sharp
    sharpModule = require('sharp');
    console.log('✅ Native Sharp module loaded successfully');
    return sharpModule;
  } catch (err) {
    console.warn('⚠️ Failed to load native Sharp module:', err.message);
    
    // Try our compatibility modules
    if (moduleExists('./sharp-compat.js')) {
      console.log('🔄 Using full Sharp compatibility layer');
      return require('./sharp-compat.js');
    } else if (moduleExists('./sharp-simple-compat.js')) {
      console.log('🔄 Using simple Sharp compatibility layer');
      return require('./sharp-simple-compat.js');
    } else {
      console.warn('⚠️ No Sharp compatibility module found, creating minimal stub');
      return createMinimalStub();
    }
  }
}

// Create a minimal stub with basic implementation
function createMinimalStub() {
  // Try to load Jimp as a fallback
  let Jimp;
  try {
    Jimp = require('jimp');
  } catch (err) {
    console.error('❌ Failed to load Jimp:', err.message);
    // If Jimp is not available, provide dummy functions
    return {
      // Basic constructor function
      __esModule: true,
      default: function(input) {
        return {
          resize: () => ({ jpeg: () => ({ toBuffer: async () => Buffer.from([]) }) }),
          jpeg: () => ({ toBuffer: async () => Buffer.from([]) }),
          png: () => ({ toBuffer: async () => Buffer.from([]) }),
          webp: () => ({ toBuffer: async () => Buffer.from([]) }),
          toBuffer: async () => Buffer.from([]),
          toFile: async () => {},
        };
      }
    };
  }
  
  // Create a minimal Sharp-like API using Jimp
  return {
    __esModule: true,
    default: function(input) {
      let jimpInstance;
      
      const api = {
        // Basic resize operation
        resize: function(width, height, options = {}) {
          return {
            ...api,
            __resize: { width, height, options }
          };
        },
        
        // Format converters
        jpeg: function(options = {}) {
          return {
            ...api,
            __format: 'jpeg',
            __options: options
          };
        },
        
        png: function(options = {}) {
          return {
            ...api,
            __format: 'png',
            __options: options
          };
        },
        
        webp: function(options = {}) {
          return {
            ...api,
            __format: 'webp',
            __options: options
          };
        },
        
        // Output methods
        toBuffer: async function() {
          try {
            if (!jimpInstance) {
              if (typeof input === 'string') {
                jimpInstance = await Jimp.read(input);
              } else if (Buffer.isBuffer(input)) {
                jimpInstance = await Jimp.read(input);
              } else {
                throw new Error('Unsupported input type');
              }
            }
            
            // Apply resize if specified
            if (api.__resize) {
              jimpInstance.resize(
                api.__resize.width || Jimp.AUTO, 
                api.__resize.height || Jimp.AUTO
              );
            }
            
            // Convert to the specified format
            const mime = api.__format === 'jpeg' ? Jimp.MIME_JPEG :
                         api.__format === 'png' ? Jimp.MIME_PNG :
                         api.__format === 'webp' ? Jimp.MIME_WEBP :
                         Jimp.MIME_JPEG;
            
            return await jimpInstance.getBufferAsync(mime);
          } catch (err) {
            console.error('Error in toBuffer:', err);
            return Buffer.from([]);
          }
        },
        
        // Save to file
        toFile: async function(outputPath) {
          try {
            if (!jimpInstance) {
              if (typeof input === 'string') {
                jimpInstance = await Jimp.read(input);
              } else if (Buffer.isBuffer(input)) {
                jimpInstance = await Jimp.read(input);
              } else {
                throw new Error('Unsupported input type');
              }
            }
            
            // Apply resize if specified
            if (api.__resize) {
              jimpInstance.resize(
                api.__resize.width || Jimp.AUTO, 
                api.__resize.height || Jimp.AUTO
              );
            }
            
            await jimpInstance.writeAsync(outputPath);
            return { path: outputPath };
          } catch (err) {
            console.error('Error in toFile:', err);
            throw err;
          }
        }
      };
      
      return api;
    }
  };
}

// Export the appropriate module
module.exports = loadSharp();
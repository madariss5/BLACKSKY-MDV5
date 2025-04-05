/**
 * Test script for Sharp compatibility layer
 * 
 * This script demonstrates how to use the Sharp compatibility layer
 * with the same API as the original Sharp library.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const termuxHelper = require('./termux-helper.js');

// Detect Termux environment
const isTermux = termuxHelper.isTermuxEnvironment();
console.log(`Running in ${isTermux ? 'Termux' : 'standard'} environment`);

// Load appropriate Sharp implementation
let sharp;
try {
  if (isTermux) {
    sharp = require('./sharp-compat.js');
    console.log('Using Sharp compatibility layer');
  } else {
    try {
      sharp = require('sharp');
      console.log('Using native Sharp library');
    } catch (err) {
      sharp = require('./sharp-compat.js');
      console.log('Using Sharp compatibility layer (fallback)');
    }
  }
} catch (err) {
  console.error('Failed to load Sharp or compatibility layer:', err);
  process.exit(1);
}

// Create directory for output if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a simple test image (blank green square)
async function createTestImage() {
  const width = 300;
  const height = 300;
  const channels = 3; // RGB
  const background = { r: 0, g: 200, b: 0 };
  
  // Create a buffer filled with the background color
  const data = Buffer.alloc(width * height * channels);
  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    data[offset] = background.r;
    data[offset + 1] = background.g;
    data[offset + 2] = background.b;
  }
  
  // Use Sharp to create the test image
  await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
  .toFile(path.join(outputDir, 'test-input.png'));
  
  console.log('Created test input image: output/test-input.png');
}

// Test various Sharp operations
async function testSharpOperations() {
  const inputPath = path.join(outputDir, 'test-input.png');
  
  // Test 1: Resize
  await sharp(inputPath)
    .resize(150, 150)
    .toFile(path.join(outputDir, 'test-resize.png'));
  console.log('✅ Test 1: Resize completed');
  
  // Test 2: Grayscale
  await sharp(inputPath)
    .grayscale()
    .toFile(path.join(outputDir, 'test-grayscale.png'));
  console.log('✅ Test 2: Grayscale completed');
  
  // Test 3: Blur
  await sharp(inputPath)
    .blur(5)
    .toFile(path.join(outputDir, 'test-blur.png'));
  console.log('✅ Test 3: Blur completed');
  
  // Test 4: Format conversion
  await sharp(inputPath)
    .jpeg({ quality: 80 })
    .toFile(path.join(outputDir, 'test-jpeg.jpg'));
  console.log('✅ Test 4: Format conversion completed');
  
  // Test 5: Rotate
  await sharp(inputPath)
    .rotate(45)
    .toFile(path.join(outputDir, 'test-rotate.png'));
  console.log('✅ Test 5: Rotate completed');
  
  // Test 6: Composite operations
  await sharp(inputPath)
    .resize(200, 200)
    .blur(2)
    .grayscale()
    .toFile(path.join(outputDir, 'test-composite.png'));
  console.log('✅ Test 6: Composite operations completed');
}

// Run the tests
async function runTests() {
  console.log('Starting Sharp compatibility tests...');
  
  try {
    await createTestImage();
    await testSharpOperations();
    
    console.log('\nAll tests completed successfully! ✅');
    console.log(`Output images can be found in: ${outputDir}`);
  } catch (err) {
    console.error('Error during tests:', err);
  }
}

// Start the tests
runTests();
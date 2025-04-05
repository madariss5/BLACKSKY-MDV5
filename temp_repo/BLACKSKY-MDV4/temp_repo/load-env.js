
const fs = require('fs');
const path = require('path');

function loadEnv() {
  // Load from .env file if it exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config();
  }
  
  // Validate required API keys
  const requiredKeys = [
    'OPENAI_API_KEY',
    'OPENWEATHERMAP_API_KEY'
  ];
  
  const missing = requiredKeys.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn('⚠️ Missing API keys:', missing.join(', '));
    console.warn('Some features may not work without these keys');
  }
}

module.exports = loadEnv;

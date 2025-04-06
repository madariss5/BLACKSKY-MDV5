
const fs = require('fs');
const path = require('path');

function loadEnv() {
  // Load from .env file if it exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config()

// Validate essential API keys
if (!process.env.OPENWEATHERMAP_API_KEY) {
  console.warn('⚠️ OpenWeatherMap API key not set - Weather commands will not work')
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ OpenAI API key not set - AI commands will not work')
}

// Export for use in commands
module.exports = {
  OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};
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

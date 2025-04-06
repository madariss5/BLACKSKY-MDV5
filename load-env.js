
const fs = require('fs');
const path = require('path');

function loadEnv() {
  // Load from .env file if it exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config();
  }

  // Set up global API configuration
  global.APIs = {
    xteam: 'https://api.xteam.xyz',
    openweather: 'https://api.openweathermap.org/data/2.5',
    openai: 'https://api.openai.com/v1'
  };

  global.APIKeys = {
    'https://api.openweathermap.org/data/2.5': process.env.OPENWEATHERMAP_API_KEY || '',
    'https://api.openai.com/v1': process.env.OPENAI_API_KEY || '',
    'https://api.xteam.xyz': process.env.XTEAM_API_KEY || ''
  };

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

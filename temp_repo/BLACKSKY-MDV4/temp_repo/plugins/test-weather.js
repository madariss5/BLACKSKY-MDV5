/**
 * Test Weather API Command
 * This is a diagnostic tool for testing OpenWeather API integration
 */

const fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`Usage:\n${usedPrefix + command} <location>\n\nExample:\n${usedPrefix + command} Berlin`);
    }
    
    // Log the test attempt
    console.log(`[TEST-WEATHER] Testing weather for location: ${text}`);
    
    // Check API key
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      console.error('[TEST-WEATHER] No API key found');
      return m.reply('⚠️ OpenWeather API key not configured');
    }
    
    console.log('[TEST-WEATHER] API key found, making request...');
    
    // Make direct API request
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(text)}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.error(`[TEST-WEATHER] Location not found: ${text}`);
        return m.reply(`Location not found: ${text}`);
      }
      
      console.error(`[TEST-WEATHER] API error: ${response.status} ${response.statusText}`);
      return m.reply(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[TEST-WEATHER] API response received:', JSON.stringify(data).substring(0, 100) + '...');
    
    // Success
    const result = {
      location: data.name,
      country: data.sys.country,
      weather: data.weather[0].description,
      currentTemp: `${data.main.temp}°C`,
      feelsLike: `${data.main.feels_like}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} m/s`
    };
    
    const weatherInfo = `🔍 Test Weather Results
Location: ${result.location}
Country: ${result.country}
Weather: ${result.weather}
Temperature: ${result.currentTemp}
Feels like: ${result.feelsLike}
Humidity: ${result.humidity}
Wind: ${result.windSpeed}

API Check: ✅ Successful`;
    
    m.reply(weatherInfo);
    
  } catch (error) {
    console.error('[TEST-WEATHER] Error:', error);
    m.reply(`Error testing weather: ${error.message}`);
  }
};

handler.help = ['testweather', 'weathertest'];
handler.tags = ['tools'];
handler.command = /^(testweather|weathertest)$/i;

module.exports = handler;
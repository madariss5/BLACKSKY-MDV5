const fetch = require('node-fetch');
const { getMessage } = require('../lib/languages');

let handler = async (m, { text, usedPrefix, command }) => {
    // Error messages in multiple languages
    const errorMessages = {
        noLocation: {
            en: `Usage:\n${usedPrefix + command} <location>\n\nExample:\n${usedPrefix + command} Berlin`,
            de: `Verwendung:\n${usedPrefix + command} <Ort>\n\nBeispiel:\n${usedPrefix + command} Berlin`,
            id: `Penggunaan:\n${usedPrefix + command} <lokasi>\n\nContoh:\n${usedPrefix + command} Jakarta`
        },
        locationNotFound: {
            en: 'Location not found',
            de: 'Ort nicht gefunden',
            id: 'Lokasi tidak ditemukan'
        },
        fetchError: {
            en: 'An error occurred while fetching weather information, please try again later',
            de: 'Bei der Suche nach Wetterinformationen ist ein Fehler aufgetreten, bitte versuchen Sie es später erneut',
            id: 'Terjadi kesalahan saat mengambil informasi cuaca, silakan coba lagi nanti'
        }
    };
    
    // Weather terms in multiple languages
    const weatherTerms = {
        location: { en: 'Location', de: 'Ort', id: 'Lokasi' },
        country: { en: 'Country', de: 'Land', id: 'Negara' },
        weather: { en: 'Weather', de: 'Wetter', id: 'Cuaca' },
        currentTemp: { en: 'Current temperature', de: 'Aktuelle Temperatur', id: 'Suhu saat ini' },
        maxTemp: { en: 'Maximum temperature', de: 'Höchsttemperatur', id: 'Suhu tertinggi' },
        minTemp: { en: 'Minimum temperature', de: 'Mindesttemperatur', id: 'Suhu terendah' },
        humidity: { en: 'Humidity', de: 'Luftfeuchtigkeit', id: 'Kelembapan' },
        windSpeed: { en: 'Wind speed', de: 'Windgeschwindigkeit', id: 'Kecepatan angin' },
        feelsLike: { en: 'Feels like', de: 'Gefühlt wie', id: 'Terasa seperti' }
    };
    
    // Get user's preferred language (default to Indonesian for this command)
    const userData = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = userData?.language || chat?.language || 'id';
    
    if (!text) throw errorMessages.noLocation[lang] || errorMessages.noLocation.id;

    // OpenWeather API key from environment variables
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
        const message = {
            en: 'OpenWeather API key not configured. Please contact the bot administrator.',
            de: 'OpenWeather API-Schlüssel nicht konfiguriert. Bitte kontaktieren Sie den Bot-Administrator.',
            id: 'OpenWeather API key tidak dikonfigurasi. Silakan hubungi administrator bot.'
        };
        m.reply(message[lang] || message.id);
        return;
    }
    
    try {
        // Get weather data directly from OpenWeather API
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(text)}&units=metric&appid=${API_KEY}`;
        let res = await fetch(url);
        
        if (!res.ok) {
            if (res.status === 404) {
                throw errorMessages.locationNotFound[lang] || errorMessages.locationNotFound.id;
            } else {
                throw errorMessages.fetchError[lang] || errorMessages.fetchError.id;
            }
        }
        
        let data = await res.json();
        
        // Format the result to match our expected structure
        const result = {
            location: data.name,
            country: data.sys.country,
            weather: data.weather[0].description,
            currentTemp: `${data.main.temp}°C`,
            feelsLike: `${data.main.feels_like}°C`,
            maxTemp: `${data.main.temp_max}°C`,
            minTemp: `${data.main.temp_min}°C`,
            humidity: `${data.main.humidity}%`,
            windSpeed: `${data.wind.speed} m/s`
        };
        
        // Get terms in user's language
        const terms = {};
        Object.keys(weatherTerms).forEach(key => {
            terms[key] = weatherTerms[key][lang] || weatherTerms[key].id;
        });
        
        // Format the weather reply with proper translations
        const weatherInfo = `${terms.location}: ${result.location}
${terms.country}: ${result.country}
${terms.weather}: ${result.weather}
${terms.currentTemp}: ${result.currentTemp}
${terms.feelsLike}: ${result.feelsLike}
${terms.maxTemp}: ${result.maxTemp}
${terms.minTemp}: ${result.minTemp}
${terms.humidity}: ${result.humidity}
${terms.windSpeed}: ${result.windSpeed}`;
        
        m.reply(weatherInfo);
    } catch (error) {
        console.error('Weather API error:', error);
        m.reply(errorMessages.fetchError[lang] || errorMessages.fetchError.id);
    }
};

handler.help = ['cuaca', 'weather', 'wetter'];
handler.tags = ['internet'];
handler.command = /^(cuaca|weather|wetter)$/i;

module.exports = handler;

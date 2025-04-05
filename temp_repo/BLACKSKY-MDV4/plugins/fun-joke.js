const { getMessage } = require('../lib/languages');
const axios = require('axios');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        m.reply(getMessage('wait', lang));
        
        // Different endpoint based on language
        let jokeEndpoint;
        
        if (lang === 'de') {
            // German jokes endpoint
            jokeEndpoint = 'https://v2.jokeapi.dev/joke/Any?lang=de&blacklistFlags=nsfw,religious,political,racist,sexist,explicit';
        } else {
            // Default to English
            jokeEndpoint = 'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit';
        }
        
        const response = await axios.get(jokeEndpoint, { timeout: 15000 });
        
        if (response.data) {
            let joke;
            let title = lang === 'de' ? '😂 *Witz*' : '😂 *Joke*';
            
            if (response.data.type === 'single') {
                // Single-line joke
                joke = response.data.joke;
            } else if (response.data.type === 'twopart') {
                // Two-part joke (setup + delivery)
                joke = `${response.data.setup}\n\n${response.data.delivery}`;
            } else {
                throw new Error('Unexpected joke format');
            }
            
            m.reply(`${title}\n\n${joke}`);
        } else {
            throw new Error('No joke found');
        }
    } catch (error) {
        console.error('Joke error:', error);
        // Double check that getMessage is actually returning something
        const errorMessage = getMessage('joke_error', lang) || 
            (lang === 'de' ? 
                'Beim Abrufen des Witzes ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.' : 
                'An error occurred while fetching the joke. Please try again later.');
        m.reply(errorMessage);
    }
};

handler.help = ['joke', 'witz'];
handler.tags = ['fun'];
handler.command = /^(joke|witz)$/i;

module.exports = handler;
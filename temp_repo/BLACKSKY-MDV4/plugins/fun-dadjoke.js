const { getMessage } = require('../lib/languages');
const axios = require('axios');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        m.reply(getMessage('wait', lang));
        
        // Get English dad jokes
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        
        if (response.data && response.data.joke) {
            let joke = response.data.joke;
            
            // For German, we'll use a simple translation service or provide hardcoded jokes
            if (lang === 'de') {
                // Try to translate the joke to German
                try {
                    const translation = await axios.get('https://api.mymemory.translated.net/get', {
                        params: {
                            q: joke,
                            langpair: 'en|de',
                            de: 'a@b.c' // Dummy email
                        },
                        timeout: 15000
                    });
                    
                    if (translation.data && translation.data.responseData && translation.data.responseData.translatedText) {
                        joke = translation.data.responseData.translatedText;
                    }
                } catch (translateError) {
                    console.log('Translation error:', translateError);
                    // If translation fails, we'll just use the English joke
                }
            }
            
            // Format the response with translation
            const title = lang === 'de' ? '👨‍👦 *Vater-Witz*' : '👨‍👦 *Dad Joke*';
            m.reply(`${title}\n\n${joke}`);
        } else {
            throw new Error('No joke found');
        }
    } catch (error) {
        console.error('Dad joke error:', error);
        // Double check that getMessage is actually returning something
        const errorMessage = getMessage('dadjoke_error', lang) || 
            (lang === 'de' ? 
                'Beim Abrufen des Vater-Witzes ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.' : 
                'An error occurred while fetching the dad joke. Please try again later.');
        m.reply(errorMessage);
    }
};

handler.help = ['dadjoke'];
handler.tags = ['fun'];
handler.command = /^(dadjoke|vaterwitze)$/i;

module.exports = handler;
const axios = require('axios');
const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    if (!text) throw getMessage('ai_example', lang, { prefix: usedPrefix, command: command });
    
    conn.beta = conn.beta ? conn.beta : {};
    if (!conn.beta[m.sender]) {
        conn.beta[m.sender] = {
            message: []
        };
        conn.beta[m.sender].Timeout = setTimeout(() => {
            delete conn.beta[m.sender];
        }, 300000);

        m.reply(getMessage('ai_greeting', lang, { name: m.name }));
    } else {
        clearTimeout(conn.beta[m.sender].Timeout);
        conn.beta[m.sender].Timeout = setTimeout(() => {
            delete conn.beta[m.sender];
        }, 300000);
    }

    let name = conn.getName(m.sender);
    const previousMessages = conn.beta[m.sender].message;
  
/** 
 * System prompt for AI - supports multiple languages based on user preference
 */
    let systemPrompt = "";
    let assistantPrompt = "";
    
    if (lang === 'de') {
        systemPrompt = "Du bist BetaBotz AI, ein AI-Assistent, der von Lann entwickelt wurde. Bitte hilf den Nutzern freundlich und füge Emoticons in deine Antworten ein. Antworte immer auf Deutsch.";
        assistantPrompt = "Du bist BetaBotz AI, ein Chatbot, der entwickelt wurde, um alle Anfragen der Nutzer zu beantworten. Antworte immer freundlich und mit Emoticons auf Deutsch.";
    } else {
        systemPrompt = "You are BetaBotz AI, an AI assistant created by Lann. Help users in a friendly way and include emoticons in your responses. Answer in English.";
        assistantPrompt = "You are BetaBotz AI, a chatbot created to help with all user requests. Always respond in a friendly manner with emoticons in English.";
    }
    
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: assistantPrompt },
        ...previousMessages.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
        { role: "user", content: text }
    ];
    try {
        const aiBeta = async function(message) {
            return new Promise(async (resolve, reject) => {
                try {
                    const params = {
                        message: message,
                        apikey: lann
                    };
                    const { data } = await axios.post('https://api.betabotz.eu.org/fire/search/openai-custom', params);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        };

        let res = await aiBeta(messages);
        if (res && res.result) {
            await m.reply(res.result);
            conn.beta[m.sender].message = messages.map(msg => msg.content);
        } else {
            throw getMessage('ai_error', lang);
        }
    } catch (e) {
        throw getMessage('ai_error', lang);
    }
};

handler.command = handler.help = ['ai','openai','chatgpt'];
handler.tags = ['tools'];
handler.premium = false
module.exports = handler;

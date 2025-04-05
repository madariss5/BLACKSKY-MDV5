let fetch = require('node-fetch');
let uploader = require('../lib/uploadImage');
const { getMessage } = require('../lib/languages.js');


let handler = m => m;

handler.before = async function(m, { conn }) {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!global.antiporn) return;
    if (!/image/.test(mime)) return;
    
    // Check if API key is available
    const apiKey = process.env.DEEPAI_API_KEY || global.deepaiApiKey;
    if (!apiKey) {
        // Skip NSFW detection if no API key is available
        return;
    }
    
    try {
        let media = await q.download();
        let url = await uploader(media);
        
        // Using DeepAI's NSFW detector API instead of BetaBotz
        const response = await fetch('https://api.deepai.org/api/nsfw-detector', {
            method: 'POST',
            headers: {
                'Api-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: url
            })
        });
        
        const res = await response.json();
        
        // DeepAI returns NSFW score between 0-1, we consider >0.7 as NSFW content
        if (res.output && res.output.nsfw_score > 0.7) {
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });
            m.reply('⚠️antiporn detected⚠️');
        }
    } catch (e) {
        console.log('Error in antiporn detection:', e);
    }
};

module.exports = handler;

const fetch = require("node-fetch");
const { getMessage } = require('../lib/languages');

const handler = async (m, {
    conn,
    args,
    usedPrefix,
    command
}) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;

    if (!args[0]) throw getMessage('download_enter_url', lang, {
        prefix: usedPrefix,
        command: command,
        example: 'https://twitter.com/gofoodindonesia/status/1229369819511709697'
    });
    
    if (!args[0].match(/https?:\/\/(www\.)?(twitter\.com|x\.com)/gi)) throw getMessage('download_invalid_url', lang, { service: 'Twitter/X' });
    
    m.reply(getMessage('wait', lang));
    
    try {
        const fire = await fetch(`https://api.betabotz.eu.org/fire/download/twitter2?url=${args[0]}&apikey=${lann}`);
        const res = await fire.json();
        const mediaURLs = res.result.mediaURLs;
        
        const capt = `*${getMessage('twitter_username', lang, {
            name: res.result.user_name,
            screen_name: res.result.user_screen_name
        })}*\n*${getMessage('twitter_title', lang, {
            text: res.result.text
        })}*\n*${getMessage('twitter_replies', lang, {
            count: res.result.replies
        })}*\n*${getMessage('twitter_retweets', lang, {
            count: res.result.retweets
        })}*`;
        
        for (const url of mediaURLs) {
            const response = await fetch(url);
            const buffer = await response.buffer();  
            await delay(3000)// 3 seconds delay to avoid spam        
            conn.sendFile(m.chat, buffer, null, capt, m);           
        }
    } catch (e) {
        throw getMessage('twitter_server_error', lang);
    }
};

handler.command = handler.help = ['twitter', 'twitdl', 'twitterdl'];
handler.tags = ['downloader'];
handler.limit = true;
handler.group = false;
handler.premium = false;
handler.owner = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;
handler.private = false;

module.exports = handler;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
        }
                                  

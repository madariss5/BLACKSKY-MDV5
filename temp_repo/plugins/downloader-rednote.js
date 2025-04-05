const { getMessage } = require('../lib/languages');

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!text) throw `Enter a URL!\n\nExample:\n${usedPrefix + command} https://xhslink.com/a/hlM81D1Yoa63`;
    try {
        if (!text.match(/xhslink|xiaohongshu/gi)) throw `URL Not found!`;
        m.reply(wait);
        let res = await axios.get(`https://api.betabotz.eu.org/fire/download/rednote?url=${text}&apikey=${lann}`);
        let result = res.data.result;
        if (!result || result.err !== 0) throw `Failed to retrieve data!`;
        if (result.video) {
            await conn.sendMessage(
                    m.chat,
                    {
                        video: {
                            url: result.video,
                        },
                        caption: `*Title:* ${result.title || "No title"}`,
                    },
                    {
                        mention: m,
                    }
                )
        } else if (result.images && result.images.length > 0) {
            for (let img of result.images) {
                await sleep(3000);
                await conn.sendMessage(m.chat, { image: img, caption: `*Title:* ${result.title || "No title"}` }, { quoted: m })
            }
        } else {
            throw `Content not found!`;
        }
    } catch (e) {
        console.error(e);
        throw `An error occurred while processing your request!`;
    }
};

handler.help = ['xiaohongshu', 'rednote'];
handler.command = /^(xiaohongshu|xhs|xhsdl|rednote)$/i;
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

}

module.exports = handler;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
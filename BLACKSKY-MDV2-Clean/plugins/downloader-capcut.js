const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    if (!args[0]) {
        throw `Enter URL!\n\nexample:\n${usedPrefix + command} https://www.capcut.com/template-detail/7273798219329441025?template_id=7273798219329441025&share_token=1ea9b68c-aa1b-4fc4-86c2-bf2b9136b6e0&enter_from=template_detail&region=ID&language=in&platform=copy_link&is_copy_link=1`;
    }

    try {
        if (!args[0].match(/capcut/gi)) {
            throw `URL Not found!`;
        }
        m.reply('*Please wait..*');

        const response = await fetch(`https://api.betabotz.eu.org/fire/download/capcut?url=${args[0]}&apikey=${lann}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        const { 
            video,
            title,
            owner
        } = res.result;

        await conn.sendFile(m.chat, video, 'capcut.mp4', `Title: ${title}\n\nProfile: ${owner}`, m);

    } catch (e) {
        console.log(e);
        throw `An error occurred!`;
    }
};

handler.help = handler.command = ['capcut','cc','capcutdl','ccdl'];
handler.tags = ['downloader'];
handler.limit = true;
handler.group = true;
}

module.exports = handler;
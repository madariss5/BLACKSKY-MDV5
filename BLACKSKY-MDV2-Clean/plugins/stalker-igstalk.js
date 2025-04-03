const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Example:\n${usedPrefix + command} erlanrahmat_14`
    try {
        let fire = await fetch(`https://api.betabotz.eu.org/fire/stalk/ig?username=${text}&apikey=${lann}`)
        let response = await fire.json()
        if (response.status) {
            let { photoUrl, postsCount, followers, following, bio, fullName, username } = response.result;
            let capt;
            capt = `乂 *I G S T A L K E R*\n\n`;
            capt += `◦ *Username* : ${username}\n`;
            capt += `◦ *Full Name* : ${fullName}\n`;
            capt += `◦ *Bio* : ${bio}\n`;
            capt += `◦ *Followers* : ${followers}\n`;           
            capt += `◦ *Following* : ${following}\n`;            
            capt += `◦ *Total Post* : ${postsCount}\n`;
           capt += `\n`;        
            return conn.sendFile(m.chat, photoUrl, 'pp.png', capt, m)
        } else {
            throw 'Sistem Currently Bermawrong!'
        }
    } catch (e) {
        m.reply('Sistem Currently Bermawrong!')
    }
}

handler.help = ['igstalk <username>']
handler.tags = ['stalk']
handler.command = /^(igstalk)$/i
handler.limit = true

module.exports = handler

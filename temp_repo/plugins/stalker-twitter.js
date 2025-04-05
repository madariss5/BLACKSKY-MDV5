const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Example:\n${usedPrefix + command} jokowi`
    try {
        let fire = await fetch(`https://api.betabotz.eu.org/fire/stalk/twitter?username=${text}&apikey=${lann}`)
        let response = await fire.json()
        if (response.status) {
            let { profileImage, bio, id, username, fullName, follower, following, totalPosts, favoritCount, createdAt, location } = response.result;
            let capt;
            capt = `乂 *T W  S T A L K E R*\n\n`;
            capt += `◦ *ID* : ${id}\n`;
            capt += `◦ *Username* : ${username}\n`;
            capt += `◦ *Full Name* : ${fullName}\n`;
            capt += `◦ *Bio* : ${bio}\n`;
            capt += `◦ *Followers* : ${follower}\n`;           
            capt += `◦ *Following* : ${following}\n`;            
            capt += `◦ *Total Post* : ${totalPosts}\n`;
            capt += `◦ *Total Favorit* : ${favoritCount}\n`;
            capt += `◦ *Created* : ${location}/${createdAt}\n`;
           capt += `\n`;        
            return conn.sendFile(m.chat, profileImage, 'pp.png', capt, m)
        } else {
            throw 'Sistem Currently Bermawrong!'
        }
    } catch (e) {
        m.reply('Sistem Currently Bermawrong!')
    }
}

handler.help = ['twitterstalk <username>']
handler.tags = ['stalk']
handler.command = /^(twstalk|twitterstalk)$/i
handler.limit = true

module.exports = handler

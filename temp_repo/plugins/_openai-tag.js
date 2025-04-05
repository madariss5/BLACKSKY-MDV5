const { getMessage } = require('../lib/languages');

const axios = require('axios');
let search = require("yt-search");

let handler = async (m, { conn, text, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
// empty
};

handler.before = async (m, { conn }) => {
    try {
        if (!m.isGroup) return;
        conn.selfai = conn.selfai || {};
        if (m.isBaileys && m.fromMe) return;
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            const botNumber = conn.user.jid.split('@')[0];
            
            const isMention = m.mentionedJid.some(mentioned => 
                mentioned.includes(botNumber)
            );
            
            if (isMention) {
                const filter = m.text.replace(/@\d+/g, '').trim();
                
                if (filter.toLowerCase() === '/reset') {
                    delete conn.selfai[m.sender];
                    await m.reply(getMessage('chat_session_successfully_rese', lang));
                    return true;
                }
                
                // If you want to add a global AI sessions reset feature
                /**if (filter.toLowerCase() === '/resetall') {
                    conn.selfai = {};
                    await m.reply(getMessage('all_chat_sessions_have_been_su', lang));
                    return true;
                }
                **/
                
                if (filter.toLowerCase().startsWith('/imagine')) {
                    const imagePrompt = filter.replace('/imagine', '').trim();
                    if (!imagePrompt) {
                        await m.reply(getMessage('please_provide_a_description_o', lang));
                        return true;
                    }

                    try {
                        await conn.sendPresenceUpdate('composing', m.chat);
                        const response = await axios.get(`https://api.betabotz.eu.org/fire/search/openai-image?apikey=${global.lann}&text=${encodeURIComponent(imagePrompt)}`, {
                            responseType: 'arraybuffer'
                        });
                        
                        const image = response.data;
                        await conn.sendFile(m.chat, image, 'aiimg.jpg', null, m);
                    } catch (error) {
                        console.error(error)
                        await m.reply(getMessage('an_error_occurred_while_creati', lang));
                    }
                    return true;
                }

                if (filter.toLowerCase().startsWith('/lagu')) {
                    const songprompt = filter.replace('/lagu', '').trim();
                    if (!songprompt) {
                        await m.reply(getMessage('please_provide_a_song_title_to', lang));
                        return true;
                    }
                        await conn.sendPresenceUpdate('composing', m.chat);
                    
                                const look = await search(songprompt);
                                const convert = look.videos[0];
                                if (!convert) throw 'video/Audio Not Found';
                                if (convert.seconds >= 3600) {
                                    return conn.reply(m.chat, 'video is longer than 1 hour!', m);
                                } else {
                                    let audioUrl;
                                    try {
                                        audioUrl = await youtube(convert.url);
                                    } catch (e) {
                                        conn.reply(m.chat, 'Please wait...', m);
                                        audioUrl = await youtube(convert.url);
                                    }
                        
                                    let caption = '';
                                    caption += `∘ Title : ${convert.title}\n`;
                                    caption += `∘ Ext : Search\n`;
                                    caption += `∘ ID : ${convert.videoId}\n`;
                                    caption += `∘ Duration : ${convert.timestamp}\n`;
                                    caption += `∘ Viewers : ${convert.views}\n`;
                                    caption += `∘ Upload At : ${convert.ago}\n`;
                                    caption += `∘ Author : ${convert.author.name}\n`;
                                    caption += `∘ Channel : ${convert.author.url}\n`;
                                    caption += `∘ Url : ${convert.url}\n`;
                                    caption += `∘ Description : ${convert.description}\n`;
                                    caption += `∘ Thumbnail : ${convert.image}`;
                        
                                    await conn.sendMessage(m.chat, {
                                        audio: {
                                            url: audioUrl.result.mp3
                                        },
                                        mimetype: 'audio/mpeg',
                                        contextInfo: {
                                            externalAdReply: {
                                                title: convert.title,
                                                body: "",
                                                thumbnailUrl: convert.image,
                                                sourceUrl: audioUrl.mp3,
                                                mediaType: 1,
                                                showAdAttribution: true,
                                                renderLargerThumbnail: true
                                            }
                                        }
                                    }, {
                                        quoted: m
                                    });
                                }
                            
                    return true;
                }
                async function youtube(url) {
                    try {
                    const { data } = await axios.get("https://api.betabotz.eu.org/fire/download/yt?url="+url+"&apikey="+lann)
                    return data;
                    } catch (e) {
                    return e;
                    }
                 }

                await conn.sendPresenceUpdate('composing', m.chat);

                if (filter.toLowerCase().startsWith('/video')) {
                    const searchvideo = filter.replace('/video', '').trim();
                    if (!searchvideo) {
                        await m.reply(getMessage('please_provide_a_video_title_t', lang));
                        return true;
                    }

                    try {
                        await conn.sendPresenceUpdate('composing', m.chat);
                         try {
                                const look = await search(searchvideo);
                                const convert = look.videos[0];
                                if (!convert) throw 'video/Audio Not Found';
                                if (convert.seconds >= 3600) {
                                    return conn.reply(m.chat, 'video is longer than 1 hour!', m);
                                } else {
                                    let videoUrl;
                                    try {
                                        videoUrl = await yts(convert.url);
                                    } catch (e) {
                                        conn.reply(m.chat, 'Please wait...', m);
                                        videoUrl = await yts(convert.url);
                                    }
                        
                                    let caption = '';
                                    caption += `∘ Title : ${convert.title}\n`;
                                    caption += `∘ Ext : Search\n`;
                                    caption += `∘ ID : ${convert.videoId}\n`;
                                    caption += `∘ Duration : ${convert.timestamp}\n`;
                                    caption += `∘ Viewers : ${convert.views}\n`;
                                    caption += `∘ Upload At : ${convert.ago}\n`;
                                    caption += `∘ Author : ${convert.author.name}\n`;
                                    caption += `∘ Channel : ${convert.author.url}\n`;
                                    caption += `∘ Url : ${convert.url}\n`;
                                    caption += `∘ Description : ${convert.description}\n`;
                                    caption += `∘ Thumbnail : ${convert.image}`;
                    
                        
                                    await conn.sendMessage(m.chat, {
                                        video: {
                                            url: videoUrl.result.mp4
                                        },
                                        mimetype: 'video/mp4',
                                        contextInfo: {
                                            externalAdReply: {
                                                title: convert.title,
                                                body: "",
                                                thumbnailUrl: convert.image,
                                                sourceUrl: videoUrl.mp4,
                                                mediaType: 1,
                                                showAdAttribution: true,
                                                renderLargerThumbnail: true
                                            }
                                        }
                                    }, {
                                        quoted: m
                                    });
                                }
                            } catch (e) {
                                conn.reply(m.chat, `*Error:* ` + e, m);
                            }


                    } catch (error) {
                        console.error(error)
                        await m.reply(getMessage('an_error_occurred_while_search', lang));
                    }
                    return true;
                }
                async function yts(url) {
                   try {
                   const { data } = await axios.get("https://api.betabotz.eu.org/fire/download/ytmp4?url="+url+"&apikey="+lann)
                   return data;
                   } catch (e) {
                   return e;
                   }
                }

                await conn.sendPresenceUpdate('composing', m.chat);
    
                if (!filter) {
                    const empty_response = [
                        `Hi ${m.name}, how can I assist you today?`,
                        `How can I help you, ${m.name}?`,
                        `Hello ${m.name}, please let me know what you need.`,
                        `${m.name}, I'm ready to help. Any questions?`,
                        `What would you like to discuss, ${m.name}?`
                    ];
                    
                    const _response_pattern = empty_response[Math.floor(Math.random() * empty_response.length)];
                    
                    await m.reply(_response_pattern);
                    return true;
                }

                if (!conn.selfai[m.sender]) {
                    conn.selfai[m.sender] = { sessionChat: [] };
                }
                
                if ([".", "#", "!", "/", "\\"].some(prefix => filter.startsWith(prefix))) return;
                
                const previousMessages = conn.selfai[m.sender].sessionChat || [];
                const messages = [
                    { role: "system", content: "You are BTZ, a personal assistant created by betabotz who is ready to help anytime. Answer every question using emoticons and be as friendly as possible to the user. Don't forget to include some humor in your answers to make the user feel comfortable :)!" },
                    { role: "assistant", content: `I'm BTZ, a personal assistant ready to help you anytime! How can I assist you today?` },
                    ...previousMessages.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
                    { role: "user", content: filter }
                ];
                
                try {
                    const chat = async function(message) {
                        return new Promise(async (resolve, reject) => {
                            try {
                                const params = {
                                    message: message,
                                    apikey: global.lann
                                };
                                const { data } = await axios.post('https://api.betabotz.eu.org/fire/search/openai-custom', params);
                                resolve(data);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    };
                    
                    let res = await chat(messages);
                    if (res && res.result) {
                        await m.reply(res.result);
                        conn.selfai[m.sender].sessionChat = [
                            ...conn.selfai[m.sender].sessionChat,
                            filter,
                            res.result
                        ];
                    } else {
                        m.reply(getMessage('error_retrieving_data_please_m', lang));
                    }
                } catch (e) {
                    console.error(e);
                    m.reply(getMessage('an_error_occurred_while_proces', lang));
                }
                return true;
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        return true;
    }
};

}

module.exports = handler;
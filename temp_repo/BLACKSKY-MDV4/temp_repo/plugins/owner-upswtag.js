const { getMessage } = require('../lib/languages');

const baileys = require("@adiwajshing/baileys");

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    async function fetchParticipants(...jids) {
        let results = [];
        for (const jid of jids) {
            let { participants } = await conn.groupMetadata(jid);
            participants = participants.map(({ id }) => id);
            results = results.concat(participants);
        }
        return results;
    }

    async function mentionstatus(jids, content) {
        const msg = await baileys.generateWAMessage(baileys.STORIES_JID, content, {
            upload: conn.waUploadToServer
        });

        let statusJidList = [];
        for (const _jid of jids) {
            if (_jid.endsWith("@g.us")) {
                for (const jid of await fetchParticipants(_jid)) {
                    statusJidList.push(jid);
                }
            } else {
                statusJidList.push(_jid);
            }
        }
        statusJidList = [...new Set(statusJidList)];

        await conn.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id,
            statusJidList,
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: jids.map((jid) => ({
                                tag: "to",
                                attrs: { jid },
                                content: undefined
                            }))
                        }
                    ]
                }
            ]
        });

        for (const jid of jids) {
            let Type = jid.endsWith("@g.us") ? "groupstatusMentionMessage" : "statusMentionMessage";
            await conn.relayMessage(jid, {
                [Type]: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            Type: 25
                        }
                    }
                }
            }, {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "true" },
                        content: undefined
                    }
                ]
            });
        }

        return msg;
    }

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    let content = {};

    if (mime) {
        let media = await q.download();

        if (/image/.test(mime)) {
            content.image = media;
        } else if (/video/.test(mime)) {
            content.video = media;
        } else if (/audio/.test(mime)) {
            content.audio = media;
        } else {
            return m.reply("Jenis file not didukung!");
        }

        if (q.text) content.caption = q.text;
    } else if (args[0]) {
        let url = args[0];
        let Type = args[1] || 'text';

        if (Type === 'image') {
            content.image = { url };
        } else if (Type === 'video') {
            content.video = { url };
        } else if (Type === 'audio') {
            content.audio = { url };
        } else {
            content.text = args.slice(1).join(" ") || url;
        }
    } else {
        return m.reply("Reply media atau masukkan URL dengan format:\n.status <url> <image/video/audio/text>");
    }

    mentionstatus([m.chat], content).catch(console.error);
};

handler.command = ['upswtag'];
handler.tags = ['tools'];
handler.help = ['upswtag'];
handler.group = true 
handler.owner = true

}

module.exports = handler;

const { getMessage } = require('../lib/languages');

const jimp = require('jimp')

const resize = async (image, width, height) => {
    const read = await jimp.read(image);
    const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
    return data;
};

const {
    emoji_role,
    sesi,
    playerOnGame,
    playerOnRoom,
    playerExit,
    dataPlayer,
    dataPlayerById,
    getPlayerById,
    getPlayerById2,
    killWerewolf,
    killww,
    dreamySeer,
    sorcerer,
    protectGuardian,
    roleShuffle,
    roleChanger,
    roleAmount,
    roleGenerator,
    addTimer,
    startGame,
    playerHidup,
    playerMati,
    vote,
    voteResult,
    clearAllVote,
    getWinner,
    win,
    pagi,
    malam,
    skill,
    voteStart,
    voteDone,
    voting,
    run,
    run_vote,
    run_malam,
    run_pagi
} = require('../lib/werewolf')

let thumb =
    "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg";

let handler = async (m, {
    conn,
    command,
    usedPrefix,
    args
}) => {
    const {
        sender,
        chat
    } = m;
    conn.werewolf = conn.werewolf ? conn.werewolf : {};
    const ww = conn.werewolf ? conn.werewolf : {};
    const data = ww[chat];
    const value = args[0];
    const target = args[1];

    // [ craft Room ]
    if (value === "create") {
        if (chat in ww) return m.reply("Group still dalam sesi game");
        if (playerOnGame(sender, ww) === true)
            return m.reply("Kamu still dalam sesi game");
        ww[chat] = {
            room: chat,
            owner: sender,
            status: false,
            iswin: null,
            cooldown: null,
            day: 0,
            time: "malem",
            player: [],
            dead: [],
            voting: false,
            seer: false,
            guardian: [],
        };
        await m.reply("Room Success created, ketik *.ww join* untuk join");

    } else if (value === "join") {
        if (!ww[chat]) return m.reply("Belum ada sesi game");
        if (ww[chat].status === true)
            return m.reply("Sesi game already dimulai");
        if (ww[chat].player.length > 16)
            return m.reply("Sorry amount player has full");
        if (playerOnRoom(sender, chat, ww) === true)
            return m.reply("Kamu already join dalam room this");
        if (playerOnGame(sender, ww) === true)
            return m.reply("Kamu still dalam sesi game");
        let data = {
            id: sender,
            number: ww[chat].player.length + 1,
            sesi: chat,
            status: false,
            role: false,
            effect: [],
            vote: 0,
            isdead: false,
            isvote: false,
        };
        ww[chat].player.push(data);
        let player = [];
        let text = `\n*⌂ W E R E W O L F - P L A Y E R*\n\n`;
        for (let i = 0; i < ww[chat].player.length; i++) {
            text += `${ww[chat].player[i].number}) @${ww[chat].player[i].id.replace(
          "@s.whatsapp.net",
          ""
        )}\n`;
            player.push(ww[chat].player[i].id);
        }
        text += "\nJumlah player minimal adalah 5 dan maximal 15";
        conn.sendMessage(
            m.chat, {
                text: text.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: "W E R E W O L F",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnail: await resize(thumb, 300, 175),
                        sourceUrl: "",
                        mediaUrl: thumb,
                    },
                    mentionedJid: player,
                },
            }, {
                quoted: m
            }
        );

        // [ Game Play ]
    } else if (value === "start") {
        if (!ww[chat]) return m.reply("Belum ada sesi game");
        if (ww[chat].player.length === 0)
            return m.reply("Room not yet memiliki player");
        if (ww[chat].player.length < 5)
            return m.reply("Sorry amount player not yet memenuhi syarat");
        if (playerOnRoom(sender, chat, ww) === false)
            return m.reply("Kamu not yet join dalam room this");
        if (ww[chat].cooldown > 0) {
            if (ww[chat].time === "voting") {
                clearAllVote(chat, ww);
                addTimer(chat, ww);
                return await run_vote(conn, chat, ww);
            } else if (ww[chat].time === "malem") {
                clearAllVote(chat, ww);
                addTimer(chat, ww);
                return await run_malam(conn, chat, ww);
            } else if (ww[chat].time === "morning") {
                clearAllVote(chat, ww);
                addTimer(chat, ww);
                return await run_pagi(conn, chat, ww);
            }
        }
        if (ww[chat].status === true)
            return m.reply("Sesi game has dimulai");
        if (ww[chat].owner !== sender)
            return m.reply(
                `Hanya player which make room which able to start game`);
        let list1 = "";
        let list2 = "";
        let player = [];
        roleGenerator(chat, ww);
        addTimer(chat, ww);
        startGame(chat, ww);
        for (let i = 0; i < ww[chat].player.length; i++) {
            list1 += `(${ww[chat].player[i].number}) @${ww[chat].player[
          i
        ].id.replace("@s.whatsapp.net", "")}\n`;
            player.push(ww[chat].player[i].id);
        }
        for (let i = 0; i < ww[chat].player.length; i++) {
            list2 += `(${ww[chat].player[i].number}) @${ww[chat].player[
          i
        ].id.replace("@s.whatsapp.net", "")} ${
          ww[chat].player[i].role === "werewolf" ||
          ww[chat].player[i].role === "sorcerer"
            ? `[${ww[chat].player[i].role}]`
            : ""
        }\n`;
            player.push(ww[chat].player[i].id);
        }
        for (let i = 0; i < ww[chat].player.length; i++) {
            // [ Werewolf ]
            if (ww[chat].player[i].role === "werewolf") {
                if (ww[chat].player[i].isdead != true) {
                    var text = `Hai ${conn.getName(
              ww[chat].player[i].id
            )}, Kamu has dipilih untuk memerankan *Werewolf* ${emoji_role(
              "werewolf"
            )} pada game kali this, Please pilih wrong one player which want you eat pada night days ini\n*LIST PLAYER*:\n${list2}\n\nType *.wwpc kill nomor* untuk kill2 player`;                 
                    await conn.sendMessage(ww[chat].player[i].id, {
                        text: text,
                        mentions: player,
                    });
                }

                // [ villager ]
            } else if (ww[chat].player[i].role === "warga") {
                if (ww[chat].player[i].isdead != true) {
                    let text = `*⌂ W E R E W O L F - G A M E*\n\nHai ${conn.getName(
              ww[chat].player[i].id
            )} Peran you adalah *Warga village* ${emoji_role(
              "warga"
            )}, tetap waspada, maybe *Werewolf* will meeatmu night this, silwill masuk kehouse masing masing.\n*LIST PLAYER*:\n${list1}`;
                    await conn.sendMessage(ww[chat].player[i].id, {
                        text: text,
                        mentions: player,
                    });
                }

                // [ Penerawangan ]
            } else if (ww[chat].player[i].role === "seer") {
                if (ww[chat].player[i].isdead != true) {
                    let text = `Hai ${conn.getName(
              ww[chat].player[i].id
            )} Kamu has terpilih  untuk menjadi *Penerawang* ${emoji_role(
              "seer"
            )}. Dengan magic which you punya, you can mengetahui peran player pilihanmu.\n*LIST PLAYER*:\n${list1}\n\nType *.wwpc dreamy nomor* untuk mesee role player`;
                 
                    await conn.sendMessage(ww[chat].player[i].id, {
                        text: text,
                        mentions: player,
                    });
                }

                // [ Guardian ]
            } else if (ww[chat].player[i].role === "guardian") {
                if (ww[chat].player[i].isdead != true) {
                    let text = `Hai ${conn.getName(
              ww[chat].player[i].id
            )} Kamu terpilih untuk memerankan *Malaikat Pelindung* ${emoji_role(
              "guardian"
            )}, dengan strength which you miliki, you can melindungi para warga, Please pilih wrong 1 player which want you lindungi\n*LIST PLAYER*:\n${list1}\n\nType *.wwpc deff nomor* untuk melindungi player`;
                 
                    await conn.sendMessage(ww[chat].player[i].id, {
                        text: text,
                        mentions: player,
                    });
                }

                // [ Sorcerer ]
            } else if (ww[chat].player[i].role === "sorcerer") {
                if (ww[chat].player[i].isdead != true) {
                    let text = `Hai ${conn.getName(
              ww[chat].player[i].id
            )} Kamu terpilih sebagai wizard ${emoji_role(
              "sorcerer"
            )}, dengan kekuasaan which you punya, you can open identitas para player, silwill pilih 1 orang which want you buka identitasnya\n*LIST PLAYER*:\n${list2}\n\nType *.wwpc sorcerer nomor* untuk mesee role player`;
                
                    await conn.sendMessage(ww[chat].player[i].id, {
                        text: text,
                        mentions: player,
                    });
                }
            }
        }
        await conn.sendMessage(m.chat, {
            text: "*⌂ W E R E W O L F - G A M E*\n\nGame has dimulai, para player will memerankan perannya masing masing, Please check chat pribadi untuk mesee role kalian. Berhati-hatilah para warga, maybe night this adalah malah terakhir untukmu",
            contextInfo: {
                externalAdReply: {
                    title: "W E R E W O L F",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnail: await resize(thumb, 300, 175),
                    sourceUrl: "",
                    mediaUrl: thumb,
                },
                mentionedJid: player,
            },
        });
        await run(conn, chat, ww);
    } else if (value === "vote") {
        if (!ww[chat]) return m.reply("Belum ada sesi game");
        if (ww[chat].status === false)
            return m.reply("Sesi game not yet dimulai");
        if (ww[chat].time !== "voting")
            return m.reply("Sesi voting not yet dimulai");
        if (playerOnRoom(sender, chat, ww) === false)
            return m.reply("Kamu not player");
        if (dataPlayer(sender, ww).isdead === true)
            return m.reply("Kamu already dead");
        if (!target || target.length < 1)
            return m.reply("Masukan nomor player");
        if (isNaN(target)) return m.reply("Use hanya nomor");
        if (dataPlayer(sender, ww).isvote === true)
            return m.reply("Kamu already melakukan voting");
        let b = getPlayerById(chat, sender, parseInt(target), ww);
        if (b.db.isdead === true)
            return m.reply(`Player ${target} already dead.`);
        if (ww[chat].player.length < parseInt(target))
            return m.reply("Invalid");
        if (getPlayerById(chat, sender, parseInt(target), ww) === false)
            return m.reply("Player not terList!");
        vote(chat, parseInt(target), sender, ww);
        conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key,
            }
        })
    } else if (value == "exit") {
        if (!ww[chat]) return m.reply("Tidak ada sesi game");
        if (playerOnRoom(sender, chat, ww) === false)
            return m.reply("Kamu not dalam sesi game");
        if (ww[chat].status === true)
            return m.reply("Permainan already dimulai, you not can exit");
        m.reply(`@${sender.split("@")[0]} exit dari game`, {
            withTag: true,
        });
        playerExit(chat, sender, ww);
    } else if (value === "delete") {
        if (!ww[chat]) return m.reply("Tidak ada sesi game");
        if (ww[chat].owner !== sender)
            return m.reply(
                `Hanya @${
            ww[chat].owner.split("@")[0]
          } which able to menghapus sesi game this`
            );
        m.reply("Sesi game Success deleted").then(() => {
            delete ww[chat];
        });
    } else if (value === "player") {
        if (!ww[chat]) return m.reply("Tidak ada sesi game");
        if (playerOnRoom(sender, chat, ww) === false)
            return m.reply("Kamu not dalam sesi game");
        if (ww[chat].player.length === 0)
            return m.reply("Sesi game not yet memiliki player");
        let player = [];
        let text = "\n*⌂ W E R E W O L F - G A M E*\n\nLIST PLAYER:\n";
        for (let i = 0; i < ww[chat].player.length; i++) {
            text += `(${ww[chat].player[i].number}) @${ww[chat].player[i].id.replace(
          "@s.whatsapp.net",
          ""
        )} ${
          ww[chat].player[i].isdead === true
            ? `☠️ ${ww[chat].player[i].role}`
            : ""
        }\n`;
            player.push(ww[chat].player[i].id);
        }
        conn.sendMessage(
            m.chat, {
                text: text,
                contextInfo: {
                    externalAdReply: {
                        title: "W E R E W O L F",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnail: await resize(thumb, 300, 175),
                        sourceUrl: "",
                        mediaUrl: thumb,
                    },
                    mentionedJid: player,
                },
            }, {
                quoted: m
            }
        );
    } else {
        let text = `\n*⌂ W E R E W O L F - G A M E*\n\ngame Sosial Yang Berlangsung Dalam Beberapa Putaran/ronde. Para player Dituntut Untuk Mencari Seorang Penjahat Yang Ada Digame. Para player Diberi Waktu, Peran, Serta abilitiesnya Masing-masing Untuk play game Ini\n\n*⌂ C O M M A N D*\n`;
        text += ` • ww create\n`;
        text += ` • ww join\n`;
        text += ` • ww start\n`;
        text += ` • ww exit\n`;
        text += ` • ww delete\n`;
        text += ` • ww player\n`;
        text += `\nPermainan this able to dimainkan oleh 5 sampai 15 orang.`;
        conn.sendMessage(
            m.chat, {
                text: text.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: "W E R E W O L F",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnail: await resize(thumb, 300, 175),
                        sourceUrl: "",
                        mediaUrl: thumb,
                    },
                },
            }, {
                quoted: m
            }
        );
    }
}
handler.help = ['werewolf'];
handler.tags = ['game'];
handler.command = ['ww','werewolf'];
handler.group = true;
module.exports = handler

const { getMessage } = require('../lib/languages');

const handler = async (m, { conn }) => {
    const lang = global.db.data.users[m.sender].language || 'en';
    conn.cowboy = conn.cowboy || {};
    const user = global.db.data.users[m.sender];

    const cooldownPeriod = 5 * 60 * 60 * 1000; // 5 hours dalam miliseconds
    const lastPlayed = user.lastKoboy || 0;
    const now = Date.now();

    if (now - lastPlayed < cooldownPeriod) {
        const remainingTime = cooldownPeriod - (now - lastPlayed);
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
        return m.reply(getMessage('rpg_cowboy_cooldown', lang, {
            hours: hours,
            minutes: minutes,
            seconds: seconds
         || {}}));
    }

    if (conn.cowboy[m.chat]) return m.reply(getMessage('kamu_currently_play_game_cowbo', lang));

    let playerPosition, criminalPosition;
    do {
        playerPosition = Math.floor(Math.random() * 6);
        criminalPosition = Math.floor(Math.random() * 6);
    } while (playerPosition === criminalPosition);

    // Create player and criminal position visuals
    const playerVisual = "・".repeat(playerPosition) + '🤠・'.repeat(5 - playerPosition);
    const criminalVisual = "・".repeat(criminalPosition) + '🏃‍♂️・'.repeat(5 - criminalPosition);
    
    let gameState = getMessage('rpg_cowboy_game_state', lang, {
        player: playerVisual,
        criminal: criminalVisual
     || {}});

    let { key } = await conn.reply(m.chat, gameState, m);

    conn.cowboy[m.chat] = {
        playerPosition,
        criminalPosition,
        key,
        oldkey: key,
        earnedExp: 10000,
        earnedMoney: 1000000,
        sender: m.sender,
        moveCount: 0,
        maxMoves: 5,
        roomId: m.chat,
        Timeout: setTimeout(() => {
            if (conn.cowboy && conn.cowboy[m.chat] && conn.cowboy[m.chat].roomId === m.chat) {
                conn.sendMessage(m.chat, { delete: key });
                delete conn.cowboy[m.chat];
            }
        }, 60000 * 2),
    };

    user.lastKoboy = now; // Simpan waktu terakhir kali game dimulai
};

handler.before = async (m, { conn }) => {
    conn.cowboy = conn.cowboy || {};
    let user = global.db.data.users[m.sender];
    const lang = user.language || 'en';
    if (!conn.cowboy[m.chat] || conn.cowboy[m.chat].roomId !== m.chat || !['kiri', 'kanan'].includes(m.text.toLowerCase())) return;

    let gameData = conn.cowboy[m.chat];
    let { playerPosition, criminalPosition, key, oldkey, moveCount, maxMoves, Timeout, earnedExp, earnedMoney, sender } = gameData;

    if (m.quoted || m.quoted.id == key) {
        if (m.text.toLowerCase() === 'kiri') {
            if (playerPosition > 0) {
                playerPosition--;
                moveCount++;
            } else {
                return m.reply(getMessage('you_have_already_berada_di_bat', lang));
            }
        } else if (m.text.toLowerCase() === 'kanan') {
            if (playerPosition < 5) {
                playerPosition++;
                moveCount++;
            } else {
                return m.reply(getMessage('you_have_already_berada_di_bat', lang));
            }
        }

        if (playerPosition === criminalPosition) {
            conn.sendMessage(m.chat, { delete: oldkey });
            let earnedMoneys = randomMoney(earnedMoney, 1);
            let earnedExps = randomMoney(earnedExp, 1);
            user.money = (user.money || 0) + earnedMoneys;
            user.exp = (user.exp || 0) + earnedExps;
            delete conn.cowboy[m.chat];
            return conn.reply(m.chat, getMessage('rpg_cowboy_success', lang, {
                user: sender.split('@')[0],
                money: formatRupiah(earnedMoneys),
                exp: earnedExps
             || {}}), m, { mentions: [sender] });
        } else if (moveCount === maxMoves) {
            conn.sendMessage(m.chat, { delete: oldkey });
            delete conn.cowboy[m.chat];
            return conn.reply(m.chat, getMessage('rpg_cowboy_fail', lang, {
                user: sender.split('@')[0]
             || {}}), m, { mentions: [sender] });
        }

        // Create player and criminal position visuals for updated game state
        const playerVisual = "・".repeat(playerPosition) + '🤠・'.repeat(5 - playerPosition);
        const criminalVisual = "・".repeat(criminalPosition) + '🏃‍♂️・'.repeat(5 - criminalPosition);
        
        let gameState = getMessage('rpg_cowboy_game_state', lang, {
            player: playerVisual,
            criminal: criminalVisual
         || {}});

        let msg = await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: key,
                Type: 14,
                editedMessage: {
                    conversation: gameState
                }
            }
        }, {});

        let additionalData = {
            ...gameData,
            playerPosition,
            moveCount,
            key: { id: msg }
        };

        conn.cowboy[m.chat] = Object.assign({}, conn.cowboy[m.chat], additionalData);
    }
};

handler.help = ['cowboy'];
handler.tags = ['rpg'];
handler.command = /^(cowboy)$/i;
handler.group = true;
handler.rpg = true;

module.exports = handler;

function randomMoney(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatRupiah(number) {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    return formatter.format(number);
}
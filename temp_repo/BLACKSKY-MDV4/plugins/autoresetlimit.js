const { getMessage } = require('../lib/languages');

/*
*reset limit auto on/off*
di buat oleh dana putra | Betabotz | aqua bot
wm this may di delete free kalian juga may study cara kerja code ny. Happy code!:)
don't lupa follow github admin = danaputra133
*/

let isAutoResetEnabled = false; 
let autoResetTimeout = null; 

let handler = async (m, { conn, args, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let lim = 10; 

    if (args.length === 0) {
        
        return conn.reply(
            m.chat,
            `*'on' atau 'off'!*\n\nExample:\n- *.${command} on* untuk mengaktifkan reset otodeads setiap hours 00:00\n- *.${command} off* untuk menonaktifkan reset otodeads`,
            null
        );
    }

    if (args[0] === 'on') {
        if (isAutoResetEnabled) {
            return conn.reply(m.chat, `*Reset limit otodeads already aktif!*`, null);
        }
        isAutoResetEnabled = true;
        scheduleDailyReset(conn, lim);
        conn.reply(m.chat, `*Reset limit otodeads will diroadkan setiap hours 00:00.*`, null);
    } else if (args[0] === 'off') {
        if (!isAutoResetEnabled) {
            return conn.reply(m.chat, `*Reset limit otodeads already nonaktif!*`, null);
        }
        isAutoResetEnabled = false;
        cancelScheduledReset(); 
        conn.reply(m.chat, `*Reset limit otodeads dinonaktifkan.*`, null);
    } else {
        return conn.reply(
            m.chat,
            `*Argumen not valid!*\nHarap gunwill 'on' atau 'off'.\n\nExample Useran:\n- *.${command} on*\n- *.${command} off*`,
            null
        );
    }
};


function resetLimit(conn, lim) {
    let list = Object.entries(global.db.data.users);
    list.map(([user, data]) => (Number(data.limit = lim)));
    conn.reply('120363361439264023@g.us', `*Limit Success direset ${lim} / user*`, null); // Kirim info ke group tercertainly
}

function getTimeUntilMidnight() {
    let now = new Date();
    let nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); 
    return nextMidnight - now;
}


function scheduleDailyReset(conn, lim) {
    let timeUntilMidnight = getTimeUntilMidnight();

    autoResetTimeout = setTimeout(() => {
        if (isAutoResetEnabled) {
            console.log(`Mereset limit User menjadi ${lim}`);
            resetLimit(conn, lim); 
            scheduleDailyReset(conn, lim); 
        }
    }, timeUntilMidnight); 
}


function cancelScheduledReset() {
    if (autoResetTimeout) {
        clearTimeout(autoResetTimeout); 
        autoResetTimeout = null;
    }
}

handler.help = ['resetauto'].map(v => 'on/off' + v);
handler.tags = ['owner'];
handler.command = /^(resetauto|rli)$/i;

handler.owner = true;

}

module.exports = handler;

const { getMessage } = require('../lib/languages');

let handler = async (m, { conn }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 
    const c = await conn.groupMetadata(m.chat);
    const online = Object.entries(conn.chats)
      .filter(
        ([k, v]) =>
          k.endsWith("@s.whatsapp.net") &&
          v.presences &&
          c.participants.some((p) => k.startsWith(p.id)),
      )
      .sort((a, b) => a[0].localeCompare(b[0], "id", { sensitivity: "base" }))
      .map(([k], i) => `*${i + 1}.* @${k.split("@")[0]}`)
      .join("\n");

    // Use translation keys for the header
    const header = getMessage('listonline_header', lang, {}, { chat: m.chat }, m);
    const divider = getMessage('listonline_divider', lang, {}, { chat: m.chat }, m);
    
    let text = `${header}\n${divider}\n`;
    
    // If no online members, show appropriate message
    if (!online) {
      text += getMessage('listonline_empty', lang, {}, { chat: m.chat }, m);
    } else {
      text += online;
    }

    conn.reply(m.chat, text, m);
};

handler.help = ["listonline"].map((a) => a + " *[get list online member]*");
handler.tags = ["group"];
handler.command = ["listonline"];
handler.group = true;
handler.admin = true;

module.exports = handler;
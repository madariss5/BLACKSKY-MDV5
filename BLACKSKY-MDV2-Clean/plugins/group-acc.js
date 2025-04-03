const { getMessage } = require('../lib/languages');

// Thanks to Kasan

let handler = async (m, { conn, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  const groupId = m.chat;
  const [subCommand, options] = args;
  const joinRequestList = await conn.groupRequestParticipantsList(groupId);

  const formatDate = (timestamp) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(timestamp * 1000));
  const reply = (text) => conn.reply(m.chat, text, m);

  switch (subCommand) {
    case "list":
      const formattedList = joinRequestList.length > 0
        ? joinRequestList.map((request, i) => `*${i + 1}.*\n• Nomor: ${request.jid.split('@')[0]}\n• Metode Permintaan: ${request.request_method}\n• Waktu Permintaan: ${formatDate(request.request_time)}\n\n`).join('')
        : "Tidak ada permintaan join which tertunda.";
      reply(`*List Permintaan join:*\n\n${formattedList}`);
      break;

    case "reject":
    case "approve":
      if (options === "all") {
        for (const request of joinRequestList) {
          await conn.groupRequestParticipantsUpdate(groupId, [request.jid], subCommand);
          console.log(`Meng-${subCommand} participant dengan JID: ${request.jid}`);
        }
        reply(`*${subCommand === 'approve' ? 'Menyetujui' : 'Menolak'} semua permintaan join.*`);
      } else {
        const actions = options.split('|').map(action => action.trim());
        const participants = actions.map(action => joinRequestList[parseInt(action) - 1]).filter(request => request);
        if (participants.length > 0) {
          let formattedResponse = '';
          for (const request of participants) {
            const response = await conn.groupRequestParticipantsUpdate(groupId, [request.jid], subCommand);
            const status = response[0].status === 'success' ? 'Success' : 'Failed';
            formattedResponse += `*${participants.indexOf(request) + 1}.*\n• status: ${status}\n• Nomor: ${request.jid.split('@')[0]}\n\n`;
            console.log(`Meng-${subCommand} participant dengan JID: ${request.jid}`);
          }
          reply(`*${subCommand === 'approve' ? 'Menyetujui' : 'Menolak'} Permintaan join:*\n\n${formattedResponse}`);
        } else {
          reply("Tidak ada anggota which cocok untuk reject/approve.");
        }
      }
      break;

    default:
      reply("Command not valid. Use *acc list*, *acc approve [number]*, *acc reject [number]*, *acc reject [JID]*, *acc reject/approve all* untuk reject/menyetujui semua permintaan join.");
  }
}

handler.help = ['acc *option*']
handler.tags = ['group']
handler.command = /^(acc)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.fail = null

}

module.exports = handler
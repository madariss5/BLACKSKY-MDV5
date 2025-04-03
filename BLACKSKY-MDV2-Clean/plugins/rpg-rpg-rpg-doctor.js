const { getMessage } = require('../lib/languages');

const STATES = {
  IDLE: 0,
  SEARCHING: 1,
  FIGHTING: 2,
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const handler = async (m, { conn, usedPrefix, command, args }) => {
  const sender = m.sender;
  // Get user's preferred language and data
  const user = global.db.data.users[sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';
  conn.playerr = conn.playerr || {};
  const player = conn.playerr[sender] || { Balance: 0, Pasien_Sembuh: 0, Waktu_Sembuh: 0, Obat_Super: 0, Lv: 1, State: STATES.IDLE };

  if (command === "doctor") {
    if (args.length === 0) {
      conn.reply(m.chat, getMessage('rpg_doctor_help', lang, { prefix: usedPrefix  || {}}), m, {
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363248530706545@newsletter', 
            newsletterName: '>>BETABOTZ RPG<<', 
            serverMessageId: -1
          },
          externalAdReply: {
            mediaType: 1,
            title: 'BETABOTZ RPG',
            thumbnailUrl: 'https://telegra.ph/file/505b8d95fd7ee7b9481e3.jpg',
            renderLargerThumbnail: true,
            sourceUrl: ''
          }
        }
      });
      return;
    }

    const subCommand = args[0];
    if (subCommand === "search" || subCommand === "cari") {
      if (player.State !== STATES.IDLE) {
        return conn.reply(m.chat, getMessage('rpg_doctor_already_searching', lang), m);
      }

      if (Date.now() - player.Waktu_Sembuh < 30000) {
        return conn.reply(m.chat, getMessage('rpg_doctor_cooldown', lang), m);
      }

      player.State = STATES.SEARCHING;
      player.Waktu_Sembuh = Date.now();

      const level = player.Lv;
      const actions = {
        1: "medicine",
        2: "care",
        3: "injection",
        4: "surgery",
      };
      const action = actions[level];

      conn.reply(m.chat, getMessage('rpg_doctor_found_patient', lang, { level: level, action: action.toUpperCase()  || {}}), m);

      player.ThiefAction = action;
    } else if (subCommand === "status") {
      conn.reply(m.chat, getMessage('rpg_doctor_status', lang, {
        searching: player.State === STATES.SEARCHING ? getMessage('rpg_yes', lang) : getMessage('rpg_no', lang),
        patients_healed: player.Pasien_Sembuh,
        balance: player.Balance.toLocaleString(),
        level: player.Lv
       || {}}), m);
    } else if (subCommand === "item") {
      if (args.length === 1) {
        conn.reply(m.chat, getMessage('rpg_doctor_item_shop', lang, {
          prefix: usedPrefix
         || {}}), m);
      } else {
        const item = args[1]?.toLowerCase();
        if (item === "medicine-super") {
          if (player.Obat_Super) {
            return conn.reply(m.chat, getMessage('rpg_doctor_already_has_medicine', lang), m);
          }

          if (player.Balance < 500) {
            return conn.reply(m.chat, getMessage('rpg_doctor_not_enough_balance', lang, { price: 500  || {}}), m);
          }

          player.Obat_Super = 1;
          player.Balance -= 500;
          conn.reply(m.chat, getMessage('rpg_doctor_medicine_purchased', lang, { prefix: usedPrefix  || {}}), m);
        } else {
          conn.reply(m.chat, getMessage('rpg_doctor_item_not_found', lang), m);
        }
      }
    } else if (subCommand === "leaderboard") {
      // Sort playerr based on the number of patients healed (descending order)
      const leaderboard = Object.entries(conn.playerr)
        .map(([playerId, playerData]) => ({ id: playerId, Pasien_Sembuh: playerData.Pasien_Sembuh }))
        .sort((a, b) => b.Pasien_Sembuh - a.Pasien_Sembuh)
        .slice(0, 5); // Show top 5 players

      let leaderboardEntries = [];
      for (let i = 0; i < leaderboard.length; i++) {
        leaderboardEntries.push(getMessage('rpg_doctor_leaderboard_entry', lang, {
          rank: i + 1,
          name: `@${leaderboard[i].id.split("@")[0]}`,
          count: leaderboard[i].Pasien_Sembuh
        }));
      }

      // If no entries, show empty message
      if (leaderboardEntries.length === 0) {
        leaderboardEntries.push(getMessage('rpg_doctor_leaderboard_empty', lang));
      }

      conn.reply(m.chat, getMessage('rpg_doctor_leaderboard', lang, {
        entries: leaderboardEntries.join('\n')
       || {}}), m);
    } else if (subCommand === "stop") {
      user.money += player.Balance * player.Pasien_Sembuh;
      
      conn.reply(m.chat, getMessage('rpg_doctor_game_stopped', lang, {
        patients_healed: player.Pasien_Sembuh,
        balance: player.Balance.toLocaleString(),
        level: player.Lv
       || {}}), m);
      
      player.State = STATES.IDLE;
      player.ThiefAction = undefined;
    } else {
      if (player.State !== STATES.SEARCHING) {
        return conn.reply(m.chat, "*🔍 You must search for a patient first with the command '.doctor search'.*", m);
      }

      const doctorAction = subCommand.toLowerCase();
      const level = player.Lv;
      const thiefActions = {
        1: ["givemedicine", "care", "inject"],
        2: ["care", "surgery"],
        3: ["surgery"],
      };

      if (!thiefActions[level].includes(doctorAction)) {
        return conn.reply(m.chat, `*🚑 Your chosen action (${doctorAction.toUpperCase()}) does not match the required treatment.*`, m);
      }

      if (thiefActions[level].includes(player.ThiefAction)) {
        let reward = 0;
        switch (doctorAction) {
          case "givemedicine":
            reward = 1000 * level;
            break;
          case "care":
            reward = 2000 * level;
            break;
          case "inject":
            reward = 3000 * level;
            break;
          case "surgery":
            reward = 5000 * level;
            break;
        }

        player.Pasien_Sembuh++;
        player.Balance += reward;
        user.money += reward;
        if (player.Balance < 5000) {
          player.Balance = 5000;
        }

        conn.reply(m.chat, `*🚑 You successfully treated and cured the level ${level} patient!* You received a reward of Rp${reward.toLocaleString()}. Your total balance: Rp${player.Balance.toLocaleString()}.`, m);
      } else {
        conn.reply(m.chat, "*🚑 Your treatment was not appropriate and the patient has died!*", m);
      }

      player.State = STATES.IDLE;
      player.ThiefAction = undefined;
    }

    conn.playerr[sender] = player;
  } else if (command === "info") {
    conn.reply(m.chat, "*ℹ️ Use the command '.doctor' to start the doctor and patient game.*", m);
  }
};

handler.help = ["doctor", "doctor search", "doctor status", "doctor item <item>", "doctor leaderboard", "doctor stop"];
handler.tags = ["rpg"];
handler.group = true;
handler.command = ["doctor"];
handler.rpg = true

module.exports = handler;
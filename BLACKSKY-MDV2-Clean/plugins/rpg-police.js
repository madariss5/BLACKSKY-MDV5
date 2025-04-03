const { getMessage } = require('../lib/languages.js');
/** !! THIS CODE GENERATE BY RODOTZBOT !! **/

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
  const user = global.db.data.users[sender]
  conn.players = conn.players || {};
  const player = conn.players[sender] || { money: 0, Pencuri_Tertangkap: 0, Waktu_Tertangkap: 0, Kaca_Pembesar: 0, level: 1, State: STATES.IDLE };

  if (command === "police") {
    const lang = (global.db.data.users[sender]?.language) || (global.db.data.chats[m.chat]?.language) || 'en';
    
    if (args.length === 0) {
      conn.reply(m.chat, getMessage('rpg_police_help', lang, {prefix: usedPrefix || {}}), m, {
        contextInfo: {
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
        return conn.reply(m.chat, getMessage('rpg_police_searching', lang), m);
      }

      if (Date.now() - player.Waktu_Tertangkap < 30000) {
        return conn.reply(m.chat, getMessage('rpg_police_wait', lang), m);
      }

      player.State = STATES.SEARCHING;
      player.Waktu_Tertangkap = Date.now();

      const level = player.level;
      const thiefActions = {
        1: "chase",
        2: "interrogate",
        3: "throw",
        4: "capture",
      };
      const thiefAction = thiefActions[level];

      const actionTranslations = {
        "chase": {
          en: "chase",
          de: "verfolgen"
        },
        "interrogate": {
          en: "interrogate",
          de: "verhören"
        },
        "throw": {
          en: "throw",
          de: "werfen"
        },
        "capture": {
          en: "capture",
          de: "festnehmen"
        }
      };

      const translatedAction = actionTranslations[thiefAction][lang] || thiefAction;
      
      conn.reply(m.chat, getMessage('rpg_police_found_tracks', lang, {
        level: level,
        action: translatedAction.toUpperCase()
       || {}}), m);

      player.ThiefAction = thiefAction;
    } else if (subCommand === "status") {
      conn.reply(m.chat, getMessage('rpg_police_status', lang, {
        searching: player.State === STATES.SEARCHING ? getMessage('rpg_police_yes', lang) : getMessage('rpg_police_no', lang),
        caught: player.Pencuri_Tertangkap,
        money: player.money.toLocaleString(),
        level: player.level
       || {}}), m);
    } else if (subCommand === "item") {
      if (args.length === 1) {
        conn.reply(m.chat, getMessage('rpg_police_item_shop', lang, {prefix: usedPrefix || {}}), m);
      } else {
        const item = args[1]?.toLowerCase();
        const itemMapping = {
          "kaca-pembig": "magnifying-glass",
          "lupe": "magnifying-glass"
        };
        
        const normalizedItem = itemMapping[item] || item;
        
        if (normalizedItem === "magnifying-glass") {
          if (player.Kaca_Pembesar) {
            return conn.reply(m.chat, getMessage('rpg_police_already_have_item', lang), m);
          }

          if (player.money < 200) {
            return conn.reply(m.chat, getMessage('rpg_police_not_enough_money', lang), m);
          }

          player.Kaca_Pembesar = 1;
          player.money -= 200;
          conn.reply(m.chat, getMessage('rpg_police_item_purchased', lang), m);
        } else {
          conn.reply(m.chat, getMessage('rpg_police_item_not_found', lang), m);
        }
      }
    } else if (subCommand === "leaderboard" || subCommand === "rangliste") {
      // Sort players based on the number of thieves caught (descending order)
      const leaderboard = Object.entries(conn.players)
        .map(([playerId, playerData]) => ({ id: playerId, caught: playerData.Pencuri_Tertangkap }))
        .sort((a, b) => b.caught - a.caught)
        .slice(0, 5); // Show top 5 players

      let leaderboardMsg = getMessage('rpg_police_leaderboard_title', lang);
      for (let i = 0; i < leaderboard.length; i++) {
        leaderboardMsg += getMessage('rpg_police_leaderboard_entry', lang, {
          position: i + 1,
          player: leaderboard[i].id.split("@")[0],
          caught: leaderboard[i].caught
         || {}});
      }

      conn.reply(m.chat, leaderboardMsg, m);
    } else if (subCommand === "stop") {
      user.money += player.money * player.Pencuri_Tertangkap;
      
      const finalScore = getMessage('rpg_police_final_score', lang, {
        caught: player.Pencuri_Tertangkap,
        money: player.money.toLocaleString(),
        level: player.level
       || {}});

      conn.reply(m.chat, getMessage('rpg_police_game_stopped', lang, {score: finalScore || {}}), m);
      player.State = STATES.IDLE;
      player.ThiefAction = undefined;
    } else {
      if (player.State !== STATES.SEARCHING) {
        return conn.reply(m.chat, getMessage('rpg_police_must_search', lang), m);
      }

      // Maps Indonesian terms and alternative commands to English actions
      const actionMapping = {
        "kejar": "chase",
        "verfolgen": "chase",
        "date request": "interrogate",
        "date": "interrogate", 
        "interrogate": "interrogate",
        "verhören": "interrogate",
        "verhoren": "interrogate",
        "lempar": "throw",
        "werfen": "throw",
        "tangkap": "capture",
        "festnehmen": "capture"
      };

      const policeAction = actionMapping[subCommand.toLowerCase()] || subCommand.toLowerCase();
      const level = player.level;
      
      // Define valid actions per level
      const thiefActions = {
        1: ["chase"],
        2: ["interrogate"],
        3: ["throw"],
        4: ["capture"],
      };

      if (thiefActions[level] && !thiefActions[level].includes(policeAction)) {
        return conn.reply(m.chat, getMessage('rpg_police_wrong_action', lang, {action: subCommand.toUpperCase() || {}}), m);
      }

      // Check if action matches the thief's action for this level
      if (player.ThiefAction === policeAction) {
        let reward = 0;
        switch (policeAction) {
          case "chase":
            reward = 1000 * level;
            break;
          case "interrogate":
            reward = 2000 * level;
            break;
          case "throw":
            reward = 3000 * level;
            break;
          case "capture":
            reward = 5000 * level;
            break;
        }

        player.Pencuri_Tertangkap++;
        player.money += reward;
        user.money += reward;
        if (player.money < 5000) {
          player.money = 5000;
        }

        conn.reply(m.chat, getMessage('rpg_police_success', lang, {
          level: level,
          reward: reward.toLocaleString(),
          money: player.money.toLocaleString()
         || {}}), m);
      } else {
        conn.reply(m.chat, getMessage('rpg_police_failed', lang), m);
      }

      player.State = STATES.IDLE;
      player.ThiefAction = undefined;
    }

    conn.players[sender] = player;
  } else if (command === "info") {
    const lang = (global.db.data.users[sender]?.language) || (global.db.data.chats[m.chat]?.language) || 'en';
    conn.reply(m.chat, getMessage('rpg_police_info', lang), m);
  }
};

handler.help = ["police", "police search", "police status", "police item <item>", "police leaderboard", "police stop"];
handler.tags = ["rpg"];
handler.group = true;
handler.command = ["police"];
handler.rpg = true
module.exports = handler;
/**
 * Horse Racing Game for WhatsApp Bot
 * Bet on horses and watch the race unfold
 */

const { randomInt, checkCooldown, formatMoney, progressBar } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

// Active horse races
const activeRaces = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for horse race game
    const MIN_BET = 200;
    const MAX_BET = 50000;
    const COOLDOWN = 20 * 1000; // 20 seconds
    const NUM_HORSES = 5;
    const RACE_LENGTH = 15; // Track length
    
    // Check if there's already an active race in this chat
    const chatId = m.chat;
    if (activeRaces[chatId]) {
      return m.reply(lang === 'de' ? 'Es läuft bereits ein Rennen in diesem Chat!' : 'There is already an active race in this chat!');
    }
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lasthorserace', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check arguments - bet amount and horse number
    if (args.length < 2) {
      return m.reply(`${getGameTranslation('horserace_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    let amount = parseInt(args[0]);
    let horseNumber = parseInt(args[1]);
    
    // Validate bet
    if (!amount || isNaN(amount)) {
      return m.reply(getGameTranslation('game_invalid_bet', lang, { min: MIN_BET, max: MAX_BET }));
    }
    
    if (amount < MIN_BET) {
      return m.reply(getGameTranslation('game_bet_too_small', lang, { amount: formatMoney(MIN_BET) }));
    }
    
    if (amount > MAX_BET) {
      return m.reply(getGameTranslation('game_bet_too_large', lang, { amount: formatMoney(MAX_BET) }));
    }
    
    if (user.money < amount) {
      return m.reply(getGameTranslation('game_not_enough_money', lang, { amount: formatMoney(amount) }));
    }
    
    // Validate horse number
    if (isNaN(horseNumber) || horseNumber < 1 || horseNumber > NUM_HORSES) {
      return m.reply(getGameTranslation('horserace_invalid_horse', lang));
    }
    
    // Deduct bet
    user.money -= amount;
    
    // Initialize horses
    const horses = [];
    const horseEmojis = ['🐎', '🏇', '🐴', '🐎', '🏇']; // Different horse emojis
    
    for (let i = 0; i < NUM_HORSES; i++) {
      horses.push({
        number: i + 1,
        position: 0,
        emoji: horseEmojis[i],
        name: `${lang === 'de' ? 'Pferd' : 'Horse'} #${i + 1}`,
        speed: randomInt(1, 3) // Base speed 1-3
      });
    }
    
    // Store race data
    activeRaces[chatId] = {
      horses,
      selectedHorse: horseNumber,
      bet: amount,
      player: m.sender,
      started: false,
      finished: false,
      winner: null
    };
    
    // Send start message
    await m.reply(getGameTranslation('horserace_start', lang));
    
    // Display initial race state
    const initialRaceDisplay = displayRace(chatId, lang);
    const raceMsg = await conn.reply(m.chat, initialRaceDisplay, m);
    
    // Start the race
    activeRaces[chatId].started = true;
    
    // Race steps - simulate the race step by step
    const steps = 10; // Number of updates
    for (let step = 0; step < steps; step++) {
      // Update horse positions
      for (const horse of horses) {
        // Random progress for each horse with some variance
        let moveAmount = randomInt(0, 4);
        
        // Add horse's base speed
        moveAmount += horse.speed;
        
        // Every few steps add some randomness for excitement
        if (step % 3 === 0) {
          // Chance for a horse to sprint or stumble
          const chance = Math.random();
          if (chance > 0.8) {
            moveAmount += randomInt(2, 4); // Sprint
          } else if (chance < 0.2) {
            moveAmount = Math.max(0, moveAmount - randomInt(1, 2)); // Stumble
          }
        }
        
        // Update position
        horse.position = Math.min(RACE_LENGTH, horse.position + moveAmount);
      }
      
      // Update race display after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if any horse finished
      const finishedHorses = horses.filter(h => h.position >= RACE_LENGTH);
      if (finishedHorses.length > 0 && !activeRaces[chatId].finished) {
        // Race finished
        activeRaces[chatId].finished = true;
        
        // Determine winner (first horse to reach the end, or furthest if multiple)
        const maxPosition = Math.max(...horses.map(h => h.position));
        const potentialWinners = horses.filter(h => h.position === maxPosition);
        
        // In case of tie, pick randomly
        const winnerIndex = randomInt(0, potentialWinners.length - 1);
        const winner = potentialWinners[winnerIndex];
        
        activeRaces[chatId].winner = winner.number;
        
        // Final race display
        const finalRaceDisplay = displayRace(chatId, lang, true);
        
        // Add result message
        let resultMessage;
        if (winner.number === horseNumber) {
          // Player won
          const winnings = amount * NUM_HORSES; // 5x for 5 horses
          user.money += winnings;
          resultMessage = getGameTranslation('horserace_win', lang, { amount: formatMoney(winnings - amount) });
        } else {
          // Player lost
          resultMessage = getGameTranslation('horserace_lose', lang, { amount: formatMoney(amount) });
        }
        
        // Update display
        conn.sendMessage(m.chat, { text: `${finalRaceDisplay}\n\n${resultMessage}` });
        
        // Update user stats
        if (!user.horserace) {
          user.horserace = {
            wins: 0,
            losses: 0,
            total: 0
          };
        }
        
        if (winner.number === horseNumber) {
          user.horserace.wins = (user.horserace.wins || 0) + 1;
        } else {
          user.horserace.losses = (user.horserace.losses || 0) + 1;
        }
        user.horserace.total = (user.horserace.total || 0) + 1;
        
        // Clean up
        delete activeRaces[chatId];
        break;
      }
      
      // Update race display
      conn.sendMessage(m.chat, { text: displayRace(chatId, lang) });
    }
    
    // If for some reason the race didn't finish, make sure it does
    if (activeRaces[chatId] && !activeRaces[chatId].finished) {
      // Force finish the race - find the furthest horse
      const maxPosition = Math.max(...horses.map(h => h.position));
      const potentialWinners = horses.filter(h => h.position === maxPosition);
      
      // In case of tie, pick randomly
      const winnerIndex = randomInt(0, potentialWinners.length - 1);
      const winner = potentialWinners[winnerIndex];
      
      activeRaces[chatId].winner = winner.number;
      activeRaces[chatId].finished = true;
      
      // Force all horses to finish
      horses.forEach(horse => {
        if (horse.number === winner.number) {
          horse.position = RACE_LENGTH;
        } else {
          horse.position = Math.min(RACE_LENGTH - 1, horse.position);
        }
      });
      
      // Final race display
      const finalRaceDisplay = displayRace(chatId, lang, true);
      
      // Add result message
      let resultMessage;
      if (winner.number === horseNumber) {
        // Player won
        const winnings = amount * NUM_HORSES; // 5x for 5 horses
        user.money += winnings;
        resultMessage = getGameTranslation('horserace_win', lang, { amount: formatMoney(winnings - amount) });
      } else {
        // Player lost
        resultMessage = getGameTranslation('horserace_lose', lang, { amount: formatMoney(amount) });
      }
      
      // Update display
      conn.sendMessage(m.chat, { text: `${finalRaceDisplay}\n\n${resultMessage}` });
      
      // Update user stats
      if (!user.horserace) {
        user.horserace = {
          wins: 0,
          losses: 0,
          total: 0
        };
      }
      
      if (winner.number === horseNumber) {
        user.horserace.wins = (user.horserace.wins || 0) + 1;
      } else {
        user.horserace.losses = (user.horserace.losses || 0) + 1;
      }
      user.horserace.total = (user.horserace.total || 0) + 1;
      
      // Clean up
      delete activeRaces[chatId];
    }
    
  } catch (e) {
    console.error('Error in horse race game:', e);
    // Clean up if error
    if (m.chat in activeRaces) {
      delete activeRaces[m.chat];
    }
    return m.reply('Error: ' + e.message);
  }
};

// Helper function to display the race track
function displayRace(chatId, lang, isFinal = false) {
  const race = activeRaces[chatId];
  if (!race) return '';
  
  const { horses, selectedHorse, winner } = race;
  const RACE_LENGTH = 15; // Make sure this matches the global definition
  
  // Sort horses by position (furthest first for close finish races)
  const sortedHorses = [...horses].sort((a, b) => b.position - a.position);
  
  // Create race display
  let display = `┏━━━[ 🏇 ${lang === 'de' ? 'PFERDERENNEN' : 'HORSE RACE'} 🏇 ]━━━┓\n┃\n`;
  
  // Display each horse with progress bar
  for (const horse of sortedHorses) {
    const isPlayerHorse = horse.number === selectedHorse;
    const isWinner = isFinal && horse.number === winner;
    
    // Create horse indicator
    const horseIndicator = isPlayerHorse ? '👉 ' : '   ';
    
    // Create progress bar
    const progressBarDisplay = progressBar(horse.position, RACE_LENGTH, RACE_LENGTH, '■', '□');
    
    // Create horse display line with special formatting for player's horse and winner
    let horseLine = `┃ ${horseIndicator}${horse.number}. ${horse.emoji} ${progressBarDisplay} `;
    
    // Add win indicator if final result
    if (isWinner) {
      horseLine += '🏆';
    }
    
    display += horseLine + '\n';
  }
  
  display += `┃\n`;
  
  // Add race status
  if (isFinal) {
    display += `┃ ${lang === 'de' ? 'Gewinner' : 'Winner'}: ${lang === 'de' ? 'Pferd' : 'Horse'} #${winner}\n`;
  } else {
    display += `┃ ${lang === 'de' ? 'Rennen läuft...' : 'Race in progress...'}\n`;
  }
  
  display += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
  
  return display;
}

handler.help = ['horserace'];
handler.tags = ['game'];
handler.command = /^(horserace|horse|race|pferderennen|pferd|rennen)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
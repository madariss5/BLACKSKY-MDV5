/**
 * Crash Game for WhatsApp Bot
 * Bet on a multiplier and cash out before it crashes
 */

const { checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

// Store active games
const activeGames = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for crash game
    const MIN_BET = 200;
    const MAX_BET = 50000;
    const COOLDOWN = 30 * 1000; // 30 seconds
    const UPDATE_INTERVAL = 1000; // 1 second between updates
    const MAX_UPDATES = 60; // Maximum number of updates (60 seconds max game length)
    
    // Handle cashout command
    if (command === 'cashout' && activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // Check if game is finished
      if (game.crashed) {
        return m.reply(lang === 'de' ? 'Das Spiel ist bereits abgestürzt!' : 'The game already crashed!');
      }
      
      if (game.cashed) {
        return m.reply(lang === 'de' ? 'Du hast bereits ausgecasht!' : 'You already cashed out!');
      }
      
      // Cash out
      game.cashed = true;
      
      // Calculate winnings
      const multiplier = game.currentMultiplier;
      const winnings = Math.floor(game.bet * multiplier);
      
      // Add winnings
      user.money += winnings;
      
      // Send cash out message
      const cashoutMessage = getGameTranslation('crash_win', lang, {
        multiplier: multiplier.toFixed(2),
        amount: formatMoney(winnings - game.bet)
      });
      
      // Update user stats
      if (!user.crash) {
        user.crash = { wins: 0, losses: 0, total: 0, highestMultiplier: 0 };
      }
      user.crash.wins = (user.crash.wins || 0) + 1;
      user.crash.total = (user.crash.total || 0) + 1;
      
      // Update highest multiplier if applicable
      if (multiplier > (user.crash.highestMultiplier || 0)) {
        user.crash.highestMultiplier = multiplier;
      }
      
      m.reply(cashoutMessage);
      return;
    }
    
    // If not a cashout command, but there's an active game
    if (activeGames[m.sender] && activeGames[m.sender].running) {
      // If they use the crash command while in a game, show current state
      if (command === 'crash') {
        const game = activeGames[m.sender];
        const multiplier = game.currentMultiplier.toFixed(2);
        
        // Show current multiplier and option to cash out
        const progressMessage = getGameTranslation('crash_progress', lang, { multiplier });
        const cashoutMessage = getGameTranslation('crash_cashout', lang, { prefix: usedPrefix });
        
        return m.reply(`${progressMessage}\n${cashoutMessage}`);
      }
      return;
    }
    
    // Start a new game (only if command is 'crash')
    if (command !== 'crash') {
      return;
    }
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastcrash', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('crash_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    // Validate bet
    if (amount < MIN_BET) {
      return m.reply(getGameTranslation('game_bet_too_small', lang, { amount: formatMoney(MIN_BET) }));
    }
    
    if (amount > MAX_BET) {
      return m.reply(getGameTranslation('game_bet_too_large', lang, { amount: formatMoney(MAX_BET) }));
    }
    
    if (user.money < amount) {
      return m.reply(getGameTranslation('game_not_enough_money', lang, { amount: formatMoney(amount) }));
    }
    
    // Deduct bet
    user.money -= amount;
    
    // Initialize game
    const crashPoint = generateCrashPoint();
    
    activeGames[m.sender] = {
      bet: amount,
      crashPoint,
      currentMultiplier: 1.0,
      crashed: false,
      cashed: false,
      running: true,
      updateCount: 0
    };
    
    // Send initial message
    await m.reply(getGameTranslation('crash_start', lang));
    
    // Start the game loop
    const gameInterval = setInterval(async () => {
      const game = activeGames[m.sender];
      
      // Check if game still exists (could have been deleted due to error)
      if (!game) {
        clearInterval(gameInterval);
        return;
      }
      
      // Increment update counter
      game.updateCount++;
      
      // Check if maximum updates reached (safety)
      if (game.updateCount >= MAX_UPDATES) {
        // Force crash
        game.crashed = true;
        game.running = false;
        
        // If player hasn't cashed out, they lose
        if (!game.cashed) {
          // Update user stats
          if (!user.crash) {
            user.crash = { wins: 0, losses: 0, total: 0, highestMultiplier: 0 };
          }
          user.crash.losses = (user.crash.losses || 0) + 1;
          user.crash.total = (user.crash.total || 0) + 1;
          
          // Send crash message
          const crashMessage = getGameTranslation('crash_crashed', lang, { multiplier: game.currentMultiplier.toFixed(2) });
          const loseMessage = getGameTranslation('crash_lose', lang, { amount: formatMoney(game.bet) });
          
          conn.reply(m.chat, `${crashMessage}\n${loseMessage}`, m);
        }
        
        // Clean up
        delete activeGames[m.sender];
        clearInterval(gameInterval);
        
        // Set cooldown
        user.lastcrash = Date.now();
        return;
      }
      
      // Update multiplier
      // The formula creates an exponential growth curve
      // Lower growth rate at the beginning, accelerating over time
      const growthRate = 0.05 + (game.updateCount * 0.005);
      game.currentMultiplier += growthRate;
      
      // Check if it's time to crash
      if (game.currentMultiplier >= game.crashPoint) {
        // Crash the game
        game.crashed = true;
        game.running = false;
        
        // If player hasn't cashed out, they lose
        if (!game.cashed) {
          // Update user stats
          if (!user.crash) {
            user.crash = { wins: 0, losses: 0, total: 0, highestMultiplier: 0 };
          }
          user.crash.losses = (user.crash.losses || 0) + 1;
          user.crash.total = (user.crash.total || 0) + 1;
          
          // Send crash message
          const crashMessage = getGameTranslation('crash_crashed', lang, { multiplier: game.crashPoint.toFixed(2) });
          const loseMessage = getGameTranslation('crash_lose', lang, { amount: formatMoney(game.bet) });
          
          conn.reply(m.chat, `${crashMessage}\n${loseMessage}`, m);
        }
        
        // Clean up
        delete activeGames[m.sender];
        clearInterval(gameInterval);
        
        // Set cooldown
        user.lastcrash = Date.now();
        return;
      }
      
      // Send update every 3 seconds
      if (game.updateCount % 3 === 0) {
        const multiplier = game.currentMultiplier.toFixed(2);
        
        // Format multiplier display
        let multiplierDisplay = '';
        if (game.currentMultiplier < 1.5) {
          multiplierDisplay = '📈';
        } else if (game.currentMultiplier < 3) {
          multiplierDisplay = '📈📈';
        } else if (game.currentMultiplier < 5) {
          multiplierDisplay = '📈📈📈';
        } else {
          multiplierDisplay = '📈📈📈📈';
        }
        
        // Show current multiplier and option to cash out
        const progressMessage = `┏━━━[ 📈 ${lang === 'de' ? 'CRASH' : 'CRASH'} 📈 ]━━━┓\n┃\n┃ ${multiplierDisplay} ${multiplier}x\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
        const cashoutMessage = getGameTranslation('crash_cashout', lang, { prefix: usedPrefix });
        
        conn.reply(m.chat, `${progressMessage}\n${cashoutMessage}`, m);
      }
    }, UPDATE_INTERVAL);
    
  } catch (e) {
    console.error('Error in crash game:', e);
    // Clean up if error
    if (m.sender in activeGames) {
      delete activeGames[m.sender];
    }
    return m.reply('Error: ' + e.message);
  }
};

// Generate a crash point based on house edge and distribution
function generateCrashPoint() {
  // Random number between 0 and 1
  const r = Math.random();
  
  // House edge (5%)
  const houseEdge = 0.05;
  
  // Base formula: 1 / (r × (1 - houseEdge))
  // This creates a distribution where:
  // - ~90% of crashes occur below 10x
  // - ~99% of crashes occur below 100x
  // - Theoretical maximum is ∞ (but practically limited)
  
  // 5% of games crash at 1.0x (instant crash)
  if (r < 0.05) {
    return 1.0;
  }
  
  const result = 0.9 / (r - 0.05) * (1 / (1 - houseEdge));
  
  // Cap the crash point at 1000x for practical purposes
  return Math.min(result, 1000);
}

handler.help = ['crash', 'cashout'];
handler.tags = ['game'];
handler.command = /^(crash|cashout)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
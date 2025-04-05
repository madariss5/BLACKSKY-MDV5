/**
 * Tower Climb Game for WhatsApp Bot
 * Climb the tower by choosing the right path
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

// Store active games
const activeGames = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for tower game
    const MIN_BET = 200;
    const MAX_BET = 50000;
    const COOLDOWN = 30 * 1000; // 30 seconds
    
    // Game parameters
    const TOWER_HEIGHT = 8; // 8 levels to climb
    
    // Check if user has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // Check if user wants to cash out
      if (command === 'cashout' || m.text.toLowerCase() === 'cashout') {
        // Calculate winnings based on current level
        const multiplier = 1 + (game.currentLevel * 0.5); // Each level adds 0.5x to multiplier
        const winnings = Math.floor(game.bet * multiplier);
        
        // Give user their winnings
        user.money += winnings;
        
        // Send cash out message
        const cashoutMessage = getGameTranslation('towers_cashout', lang, { amount: formatMoney(winnings - game.bet) });
        
        // Display the final tower
        const towerDisplay = displayTower(game, lang);
        
        // Delete the game
        delete activeGames[m.sender];
        
        // Update user stats
        if (!user.towers) {
          user.towers = { wins: 0, losses: 0, cashouts: 0, total: 0, highestLevel: 0 };
        }
        user.towers.cashouts = (user.towers.cashouts || 0) + 1;
        user.towers.total = (user.towers.total || 0) + 1;
        
        // Update highest level if applicable
        if (game.currentLevel > (user.towers.highestLevel || 0)) {
          user.towers.highestLevel = game.currentLevel;
        }
        
        // Set cooldown
        user.lasttowers = Date.now();
        
        return m.reply(`${towerDisplay}\n\n${cashoutMessage}`);
      }
      
      // Handle position selection
      const positions = ['left', 'middle', 'right', 'links', 'mitte', 'rechts', 'l', 'm', 'r'];
      const input = m.text.trim().toLowerCase();
      
      if (positions.includes(input)) {
        // Normalize position input
        let position;
        if (input === 'left' || input === 'links' || input === 'l') {
          position = 0;
        } else if (input === 'middle' || input === 'mitte' || input === 'm') {
          position = 1;
        } else {
          position = 2;
        }
        
        // Check if it's a safe position
        const isSafe = !game.dangerPositions[game.currentLevel].includes(position);
        
        if (isSafe) {
          // Move up one level
          game.currentLevel++;
          game.selectedPositions.push(position);
          
          // Check if player reached the top
          if (game.currentLevel >= TOWER_HEIGHT) {
            // Player won!
            const winnings = game.bet * 10; // 10x for reaching the top
            user.money += winnings;
            
            // Display the final tower
            const towerDisplay = displayTower(game, lang);
            
            // Send win message
            const winMessage = getGameTranslation('towers_win', lang, { amount: formatMoney(winnings - game.bet) });
            
            // Delete the game
            delete activeGames[m.sender];
            
            // Update user stats
            if (!user.towers) {
              user.towers = { wins: 0, losses: 0, cashouts: 0, total: 0, highestLevel: 0 };
            }
            user.towers.wins = (user.towers.wins || 0) + 1;
            user.towers.total = (user.towers.total || 0) + 1;
            user.towers.highestLevel = TOWER_HEIGHT;
            
            // Set cooldown
            user.lasttowers = Date.now();
            
            return m.reply(`${towerDisplay}\n\n${winMessage}`);
          }
          
          // Continue climbing
          const safeMessage = getGameTranslation('towers_safe', lang);
          
          // Display the updated tower
          const towerDisplay = displayTower(game, lang);
          
          // Add cashout option if player is past level 1
          let cashoutOption = '';
          if (game.currentLevel > 1) {
            const multiplier = 1 + (game.currentLevel * 0.5);
            const potentialWinnings = Math.floor(game.bet * multiplier);
            cashoutOption = `\n\n${lang === 'de' ? 'Tippe' : 'Type'} "cashout" ${lang === 'de' ? 'um' : 'to'} ${formatMoney(potentialWinnings - game.bet)} ${lang === 'de' ? 'einzusammeln' : 'collect'}!`;
          }
          
          return m.reply(`${towerDisplay}\n\n${safeMessage}${cashoutOption}`);
        } else {
          // Player fell
          const fallMessage = getGameTranslation('towers_fall', lang);
          const loseMessage = getGameTranslation('towers_lose', lang, { amount: formatMoney(game.bet) });
          
          // Reveal the dangerous position
          game.revealedDangers[game.currentLevel] = true;
          
          // Display the final tower
          const towerDisplay = displayTower(game, lang);
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.towers) {
            user.towers = { wins: 0, losses: 0, cashouts: 0, total: 0, highestLevel: 0 };
          }
          user.towers.losses = (user.towers.losses || 0) + 1;
          user.towers.total = (user.towers.total || 0) + 1;
          
          // Update highest level if applicable
          if (game.currentLevel > (user.towers.highestLevel || 0)) {
            user.towers.highestLevel = game.currentLevel;
          }
          
          // Set cooldown
          user.lasttowers = Date.now();
          
          return m.reply(`${towerDisplay}\n\n${fallMessage}\n${loseMessage}`);
        }
      }
      
      // If not a valid position, just show the current tower
      const towerDisplay = displayTower(game, lang);
      const chooseMessage = getGameTranslation('towers_choose', lang);
      
      // Add cashout option if player is past level 1
      let cashoutOption = '';
      if (game.currentLevel > 1) {
        const multiplier = 1 + (game.currentLevel * 0.5);
        const potentialWinnings = Math.floor(game.bet * multiplier);
        cashoutOption = `\n\n${lang === 'de' ? 'Tippe' : 'Type'} "cashout" ${lang === 'de' ? 'um' : 'to'} ${formatMoney(potentialWinnings - game.bet)} ${lang === 'de' ? 'einzusammeln' : 'collect'}!`;
      }
      
      return m.reply(`${towerDisplay}\n\n${chooseMessage}${cashoutOption}`);
    }
    
    // No active game, so start a new one
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lasttowers', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('towers_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Generate danger positions for each level
    const dangerPositions = [];
    
    for (let i = 0; i < TOWER_HEIGHT; i++) {
      // Number of danger spots increases with level
      const numDangers = Math.min(2, Math.floor(i / 3) + 1);
      const dangers = [];
      
      while (dangers.length < numDangers) {
        const pos = randomInt(0, 2);
        if (!dangers.includes(pos)) {
          dangers.push(pos);
        }
      }
      
      dangerPositions.push(dangers);
    }
    
    // Create a new game
    activeGames[m.sender] = {
      bet: amount,
      currentLevel: 0,
      dangerPositions,
      selectedPositions: [],
      revealedDangers: Array(TOWER_HEIGHT).fill(false),
      startTime: Date.now()
    };
    
    // Display the initial tower
    const towerDisplay = displayTower(activeGames[m.sender], lang);
    
    // Send initial message
    const startMessage = getGameTranslation('towers_start', lang);
    const chooseMessage = getGameTranslation('towers_choose', lang);
    
    return m.reply(`${startMessage}\n\n${towerDisplay}\n\n${chooseMessage}`);
    
  } catch (e) {
    console.error('Error in towers game:', e);
    // Clean up if error
    if (m.sender in activeGames) {
      delete activeGames[m.sender];
    }
    return m.reply('Error: ' + e.message);
  }
};

// Function to display the tower
function displayTower(game, lang) {
  const TOWER_HEIGHT = 8;
  const { currentLevel, selectedPositions, dangerPositions, revealedDangers } = game;
  
  // Tower symbols
  const symbols = {
    empty: '□',
    player: '👤',
    danger: '💥',
    safe: '✓',
    current: ['⬅️', '⬆️', '➡️']
  };
  
  // Create tower display
  let towerDisplay = `┏━━━[ 🏢 ${lang === 'de' ? 'TURMBESTEIGUNG' : 'TOWER CLIMB'} 🏢 ]━━━┓\n┃\n`;
  
  // Build tower from top to bottom
  for (let level = TOWER_HEIGHT - 1; level >= 0; level--) {
    const isCurrentLevel = level === currentLevel;
    const isVisitedLevel = level < currentLevel;
    
    // Create the level display
    let levelDisplay = '┃   ';
    
    for (let pos = 0; pos < 3; pos++) {
      // Determine what to display in this position
      let symbol;
      
      if (isCurrentLevel) {
        // Current level - show options
        symbol = symbols.current[pos];
      } else if (isVisitedLevel) {
        // Already visited level
        if (selectedPositions[level] === pos) {
          // Player's path
          symbol = symbols.player;
        } else if (revealedDangers[level] && dangerPositions[level].includes(pos)) {
          // Revealed danger
          symbol = symbols.danger;
        } else {
          // Empty space
          symbol = symbols.empty;
        }
      } else {
        // Future level - empty
        symbol = symbols.empty;
      }
      
      levelDisplay += ` ${symbol} `;
      
      // Add separators
      if (pos < 2) levelDisplay += '│';
    }
    
    // Add level number
    levelDisplay += ` ${level + 1}`;
    
    towerDisplay += levelDisplay + '\n';
    
    // Add separators between levels
    if (level > 0) {
      towerDisplay += '┃   ───┼───┼─── \n';
    }
  }
  
  // Add display information
  towerDisplay += `┃\n`;
  towerDisplay += `┃   ${getGameTranslation('towers_display', lang, { level: currentLevel + 1, maxLevel: TOWER_HEIGHT })}\n`;
  towerDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
  
  return towerDisplay;
}

handler.help = ['towers', 'cashout'];
handler.tags = ['game'];
handler.command = /^(towers?|tower?climb|turmbesteigung|turm|cashout)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
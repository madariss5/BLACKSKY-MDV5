/**
 * Bingo Game for WhatsApp Bot
 * Classic bingo game where players mark numbers as they are called
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
    
    // Default values for bingo game
    const MIN_BET = 200;
    const MAX_BET = 20000;
    const COOLDOWN = 30 * 1000; // 30 seconds
    
    // Game parameters
    const BOARD_SIZE = 5; // 5x5 grid
    const NUM_DRAWS = 35; // Maximum number of numbers to draw
    
    // Check if user already has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // Check if the game is waiting for player to continue
      if (game.waitingForPlayer) {
        // Continue the game (draw the next number)
        const nextIndex = game.currentDraw + 1;
        
        // Check if we've reached the maximum number of draws
        if (nextIndex >= NUM_DRAWS) {
          // Game over - player didn't get bingo
          const loseMessage = getGameTranslation('bingo_lose', lang, { amount: formatMoney(game.bet) });
          
          // Show final card
          const cardDisplay = formatBingoCard(game.card, game.marked, lang);
          const numbersDrawn = game.drawnNumbers.slice(0, nextIndex).join(', ');
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.bingo) {
            user.bingo = { wins: 0, losses: 0, total: 0 };
          }
          user.bingo.losses = (user.bingo.losses || 0) + 1;
          user.bingo.total = (user.bingo.total || 0) + 1;
          
          // Set cooldown
          user.lastbingo = Date.now();
          
          return m.reply(`${cardDisplay}\n\n${lang === 'de' ? 'Gezogene Zahlen' : 'Numbers drawn'}: ${numbersDrawn}\n\n${loseMessage}`);
        }
        
        // Draw the next number
        const nextNumber = game.drawnNumbers[nextIndex];
        game.currentDraw = nextIndex;
        
        // Check if the number is on the player's card
        let isMatch = false;
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            // Skip the free center space
            if (i === 2 && j === 2) continue;
            
            if (game.card[i][j] === nextNumber) {
              game.marked[i][j] = true;
              isMatch = true;
              break;
            }
          }
          if (isMatch) break;
        }
        
        // Format the bingo card
        const cardDisplay = formatBingoCard(game.card, game.marked, lang);
        
        // Check if the player has a bingo
        const hasBingo = checkForBingo(game.marked);
        
        if (hasBingo) {
          // Player wins!
          // Calculate winnings based on how many numbers were drawn
          // Fewer numbers = higher payout
          const multiplier = 2 + Math.max(0, (NUM_DRAWS - nextIndex) * 0.1);
          const winAmount = Math.floor(game.bet * multiplier);
          user.money += winAmount;
          
          // Send win message
          const winMessage = getGameTranslation('bingo_win', lang, { amount: formatMoney(winAmount - game.bet) });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.bingo) {
            user.bingo = { wins: 0, losses: 0, total: 0 };
          }
          user.bingo.wins = (user.bingo.wins || 0) + 1;
          user.bingo.total = (user.bingo.total || 0) + 1;
          
          // Set cooldown
          user.lastbingo = Date.now();
          
          return m.reply(`${cardDisplay}\n\n${lang === 'de' ? 'BINGO!' : 'BINGO!'}\n\n${winMessage}`);
        }
        
        // Game continues
        if (isMatch) {
          // Match found on card
          const matchMessage = getGameTranslation('bingo_match', lang, { number: nextNumber });
          game.waitingForPlayer = true;
          
          return m.reply(`${cardDisplay}\n\n${getGameTranslation('bingo_next', lang, { number: nextNumber })}\n\n${matchMessage}\n\n${getGameTranslation('bingo_numbers_left', lang, { count: NUM_DRAWS - nextIndex - 1 })}`);
        } else {
          // No match
          const noMatchMessage = getGameTranslation('bingo_no_match', lang, { number: nextNumber });
          game.waitingForPlayer = true;
          
          return m.reply(`${cardDisplay}\n\n${getGameTranslation('bingo_next', lang, { number: nextNumber })}\n\n${noMatchMessage}\n\n${getGameTranslation('bingo_numbers_left', lang, { count: NUM_DRAWS - nextIndex - 1 })}`);
        }
      }
      
      // If not waiting for player input, show the current state
      const cardDisplay = formatBingoCard(game.card, game.marked, lang);
      const currentNumber = game.drawnNumbers[game.currentDraw];
      
      return m.reply(`${cardDisplay}\n\n${getGameTranslation('bingo_next', lang, { number: currentNumber })}\n\n${getGameTranslation('bingo_numbers_left', lang, { count: NUM_DRAWS - game.currentDraw - 1 })}`);
    }
    
    // Not a continuation of a game, so must be starting a new game
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastbingo', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('bingo_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Deduct the bet
    user.money -= amount;
    
    // Generate bingo card
    const { card, marked } = generateBingoCard();
    
    // Generate random number sequence (1-75)
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    shuffleArray(numbers);
    const drawnNumbers = numbers.slice(0, NUM_DRAWS);
    
    // Create a new game
    activeGames[m.sender] = {
      card,
      marked,
      drawnNumbers,
      currentDraw: 0,
      waitingForPlayer: true,
      bet: amount,
      startTime: Date.now()
    };
    
    // Set cooldown when game starts (will be updated when game ends)
    user.lastbingo = Date.now();
    
    // Format the bingo card
    const cardDisplay = formatBingoCard(card, marked, lang);
    
    // Send initial message
    const startMessage = getGameTranslation('bingo_start', lang);
    const cardMessage = getGameTranslation('bingo_card', lang, { card: cardDisplay });
    const firstNumber = drawnNumbers[0];
    const nextMessage = getGameTranslation('bingo_next', lang, { number: firstNumber });
    
    return m.reply(`${startMessage}\n\n${cardDisplay}\n\n${nextMessage}`);
    
  } catch (e) {
    console.error('Error in bingo game:', e);
    return m.reply('Error: ' + e.message);
  }
};

// Generate a bingo card
function generateBingoCard() {
  const BOARD_SIZE = 5;
  const card = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
  const marked = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
  
  // In bingo, columns have specific ranges:
  // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  for (let col = 0; col < BOARD_SIZE; col++) {
    const min = col * 15 + 1;
    const max = min + 14;
    
    // Generate random numbers for this column
    const colNumbers = [];
    while (colNumbers.length < BOARD_SIZE) {
      const num = randomInt(min, max);
      if (!colNumbers.includes(num)) {
        colNumbers.push(num);
      }
    }
    
    // Assign numbers to the card
    for (let row = 0; row < BOARD_SIZE; row++) {
      card[row][col] = colNumbers[row];
    }
  }
  
  // Set the center square as free
  card[2][2] = 'FREE';
  marked[2][2] = true;
  
  return { card, marked };
}

// Format the bingo card for display
function formatBingoCard(card, marked, lang) {
  const BOARD_SIZE = 5;
  const BINGO = ['B', 'I', 'N', 'G', 'O'];
  
  // Create header
  let display = '┌─────┬─────┬─────┬─────┬─────┐\n';
  display += '│  B  │  I  │  N  │  G  │  O  │\n';
  display += '├─────┼─────┼─────┼─────┼─────┤\n';
  
  // Create rows
  for (let row = 0; row < BOARD_SIZE; row++) {
    let rowStr = '│';
    
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = card[row][col];
      const isMarked = marked[row][col];
      
      // Format cell content
      let cell;
      if (value === 'FREE') {
        cell = ' ✓✓ ';
      } else {
        // Pad numbers to be aligned
        const numStr = value.toString().padStart(2, ' ');
        cell = isMarked ? `*${numStr}*` : ` ${numStr} `;
      }
      
      rowStr += cell + '│';
    }
    
    display += rowStr + '\n';
    
    // Add separator between rows (except after the last row)
    if (row < BOARD_SIZE - 1) {
      display += '├─────┼─────┼─────┼─────┼─────┤\n';
    }
  }
  
  // Add bottom border
  display += '└─────┴─────┴─────┴─────┴─────┘';
  
  // Add title and instructions
  const title = `🎯 ${lang === 'de' ? 'BINGO' : 'BINGO'}`;
  return `┏━━━[ ${title} ]━━━┓\n┃\n${display}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
}

// Check if the player has a bingo
function checkForBingo(marked) {
  const BOARD_SIZE = 5;
  
  // Check rows
  for (let row = 0; row < BOARD_SIZE; row++) {
    let rowComplete = true;
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!marked[row][col]) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }
  
  // Check columns
  for (let col = 0; col < BOARD_SIZE; col++) {
    let colComplete = true;
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (!marked[row][col]) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }
  
  // Check diagonal (top-left to bottom-right)
  let diag1Complete = true;
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (!marked[i][i]) {
      diag1Complete = false;
      break;
    }
  }
  if (diag1Complete) return true;
  
  // Check diagonal (top-right to bottom-left)
  let diag2Complete = true;
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (!marked[i][BOARD_SIZE - 1 - i]) {
      diag2Complete = false;
      break;
    }
  }
  if (diag2Complete) return true;
  
  return false;
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

handler.help = ['bingo'];
handler.tags = ['game'];
handler.command = /^(bingo)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
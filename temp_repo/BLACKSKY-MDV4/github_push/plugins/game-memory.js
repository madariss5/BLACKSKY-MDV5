/**
 * Memory Game for WhatsApp Bot
 * Match pairs of symbols in a grid
 */

const { randomEmojis, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

// Store active games
const activeGames = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for memory game
    const MIN_BET = 200;
    const MAX_BET = 20000;
    const COOLDOWN = 60 * 1000; // 60 seconds
    
    // Game parameters
    const GRID_SIZE = 4; // 4x4 grid (16 cards)
    const MAX_MOVES = 30; // Maximum number of moves allowed
    
    // Check if user already has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // Check for a selection
      const input = m.text.trim().toUpperCase();
      
      // Parse input like "A1 B3"
      if (/^[A-D][1-4]\s+[A-D][1-4]$/.test(input)) {
        // Split the input into two coordinates
        const [coord1, coord2] = input.split(/\s+/);
        
        // Convert the coordinates to row/column indices
        const row1 = parseInt(coord1.charAt(1)) - 1;
        const col1 = coord1.charCodeAt(0) - 65;
        const row2 = parseInt(coord2.charAt(1)) - 1;
        const col2 = coord2.charCodeAt(0) - 65;
        
        // Check if they're different positions
        if (row1 === row2 && col1 === col2) {
          return m.reply(lang === 'de' ? 'Du musst zwei verschiedene Positionen wählen!' : 'You must select two different positions!');
        }
        
        // Check if either card is already revealed
        if (game.revealed[row1][col1] || game.revealed[row2][col2]) {
          return m.reply(lang === 'de' ? 'Eine oder beide Karten wurden bereits aufgedeckt!' : 'One or both cards have already been revealed!');
        }
        
        // Increment move counter
        game.moves++;
        
        // Reveal the two cards
        const symbol1 = game.board[row1][col1];
        const symbol2 = game.board[row2][col2];
        
        // Check if they match
        const isMatch = symbol1 === symbol2;
        
        if (isMatch) {
          // Mark cards as permanently revealed
          game.revealed[row1][col1] = true;
          game.revealed[row2][col2] = true;
          game.matches++;
          
          // Send match message
          const matchMessage = getGameTranslation('memory_match', lang, { symbol: symbol1 });
          
          // Display the updated board
          const boardDisplay = formatMemoryBoard(game.board, game.revealed, lang);
          
          // Check if all pairs are found
          const totalPairs = (GRID_SIZE * GRID_SIZE) / 2;
          
          if (game.matches === totalPairs) {
            // Game won!
            // Calculate winnings based on remaining moves
            const movesLeft = MAX_MOVES - game.moves;
            const multiplier = 2 + Math.max(0, movesLeft * 0.1); // Bonus for fewer moves
            const winnings = Math.floor(game.bet * multiplier);
            user.money += winnings;
            
            // Send win message
            const winMessage = getGameTranslation('memory_win', lang, { amount: formatMoney(winnings - game.bet) });
            
            // Delete the game
            delete activeGames[m.sender];
            
            // Update user stats
            if (!user.memory) {
              user.memory = { wins: 0, losses: 0, total: 0 };
            }
            user.memory.wins = (user.memory.wins || 0) + 1;
            user.memory.total = (user.memory.total || 0) + 1;
            
            // Set cooldown
            user.lastmemory = Date.now();
            
            return m.reply(`${boardDisplay}\n\n${matchMessage}\n\n${winMessage}`);
          }
          
          // Game continues
          const movesLeftMessage = getGameTranslation('memory_moves', lang, { moves: MAX_MOVES - game.moves });
          const selectMessage = getGameTranslation('memory_select', lang);
          
          return m.reply(`${boardDisplay}\n\n${matchMessage}\n\n${movesLeftMessage}\n\n${selectMessage}`);
        } else {
          // No match - show cards temporarily
          const tempRevealed = JSON.parse(JSON.stringify(game.revealed));
          tempRevealed[row1][col1] = true;
          tempRevealed[row2][col2] = true;
          
          // Display the board with temporarily revealed cards
          const boardDisplay = formatMemoryBoard(game.board, tempRevealed, lang);
          
          // Send no match message
          const noMatchMessage = getGameTranslation('memory_no_match', lang);
          
          // Check if out of moves
          if (game.moves >= MAX_MOVES) {
            // Game over - out of moves
            const loseMessage = getGameTranslation('memory_lose', lang, { amount: formatMoney(game.bet) });
            
            // Delete the game
            delete activeGames[m.sender];
            
            // Update user stats
            if (!user.memory) {
              user.memory = { wins: 0, losses: 0, total: 0 };
            }
            user.memory.losses = (user.memory.losses || 0) + 1;
            user.memory.total = (user.memory.total || 0) + 1;
            
            // Set cooldown
            user.lastmemory = Date.now();
            
            return m.reply(`${boardDisplay}\n\n${noMatchMessage}\n\n${loseMessage}`);
          }
          
          // Game continues
          const movesLeftMessage = getGameTranslation('memory_moves', lang, { moves: MAX_MOVES - game.moves });
          const selectMessage = getGameTranslation('memory_select', lang);
          
          return m.reply(`${boardDisplay}\n\n${noMatchMessage}\n\n${movesLeftMessage}\n\n${selectMessage}`);
        }
      }
      
      // If not a valid selection, show the current board
      const boardDisplay = formatMemoryBoard(game.board, game.revealed, lang);
      const movesLeftMessage = getGameTranslation('memory_moves', lang, { moves: MAX_MOVES - game.moves });
      const selectMessage = getGameTranslation('memory_select', lang);
      
      return m.reply(`${boardDisplay}\n\n${movesLeftMessage}\n\n${selectMessage}`);
    }
    
    // Not a continuation of a game, so must be starting a new game
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastmemory', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('memory_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Generate a memory game board
    const { board, revealed } = generateMemoryBoard(GRID_SIZE);
    
    // Create a new game
    activeGames[m.sender] = {
      board,
      revealed,
      moves: 0,
      matches: 0,
      bet: amount,
      startTime: Date.now()
    };
    
    // Set cooldown when game starts (will be updated when game ends)
    user.lastmemory = Date.now();
    
    // Format the memory board
    const boardDisplay = formatMemoryBoard(board, revealed, lang);
    
    // Send initial message
    const startMessage = getGameTranslation('memory_start', lang);
    const selectMessage = getGameTranslation('memory_select', lang);
    const movesLeftMessage = getGameTranslation('memory_moves', lang, { moves: MAX_MOVES });
    
    return m.reply(`${startMessage}\n\n${boardDisplay}\n\n${movesLeftMessage}\n\n${selectMessage}`);
    
  } catch (e) {
    console.error('Error in memory game:', e);
    return m.reply('Error: ' + e.message);
  }
};

// Generate a memory game board
function generateMemoryBoard(size) {
  // Create a set of symbols (need size*size/2 pairs)
  const MEMORY_SYMBOLS = ['🍎', '🍌', '🍇', '🍉', '🍊', '🍋', '🍒', '🥥', '🥝', '🍓', '🍈', '🍍', '🥭', '🍑', '🍐', '🍏'];
  
  // Create a flat array with pairs of symbols
  const numPairs = (size * size) / 2;
  let symbolPairs = [];
  
  for (let i = 0; i < numPairs; i++) {
    symbolPairs.push(MEMORY_SYMBOLS[i % MEMORY_SYMBOLS.length]);
    symbolPairs.push(MEMORY_SYMBOLS[i % MEMORY_SYMBOLS.length]);
  }
  
  // Shuffle the pairs
  for (let i = symbolPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [symbolPairs[i], symbolPairs[j]] = [symbolPairs[j], symbolPairs[i]];
  }
  
  // Create the board
  const board = [];
  const revealed = [];
  
  for (let i = 0; i < size; i++) {
    board[i] = [];
    revealed[i] = [];
    
    for (let j = 0; j < size; j++) {
      board[i][j] = symbolPairs[i * size + j];
      revealed[i][j] = false; // All cards start face down
    }
  }
  
  return { board, revealed };
}

// Format memory board for display
function formatMemoryBoard(board, revealed, lang) {
  const size = board.length;
  
  // Column headers (A-D)
  let display = '    ';
  for (let c = 0; c < size; c++) {
    display += ` ${String.fromCharCode(65 + c)} `;
  }
  display += '\n';
  
  // Top border
  display += '   ┌';
  for (let c = 0; c < size; c++) {
    display += '───';
    if (c < size - 1) display += '┬';
  }
  display += '┐\n';
  
  // Rows
  for (let r = 0; r < size; r++) {
    // Row number
    display += ` ${r + 1} │`;
    
    // Cells
    for (let c = 0; c < size; c++) {
      const cell = board[r][c];
      
      if (revealed[r][c]) {
        // Show the content for revealed cards
        display += ` ${cell} `;
      } else {
        // Hidden card
        display += ' ? ';
      }
      
      // Cell separator
      if (c < size - 1) display += '│';
    }
    
    // Row end
    display += '│\n';
    
    // Row separator
    if (r < size - 1) {
      display += '   ├';
      for (let c = 0; c < size; c++) {
        display += '───';
        if (c < size - 1) display += '┼';
      }
      display += '┤\n';
    }
  }
  
  // Bottom border
  display += '   └';
  for (let c = 0; c < size; c++) {
    display += '───';
    if (c < size - 1) display += '┴';
  }
  display += '┘';
  
  // Add title
  const title = `🧠 ${lang === 'de' ? 'MEMORY-SPIEL' : 'MEMORY GAME'}`;
  return `┏━━━[ ${title} ]━━━┓\n┃\n${display}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
}

handler.help = ['memory'];
handler.tags = ['game'];
handler.command = /^(memory|memoryspiel|memgame)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
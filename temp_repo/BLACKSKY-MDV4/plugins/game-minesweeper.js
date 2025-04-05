/**
 * Minesweeper Game for WhatsApp Bot
 * Reveal cells without hitting a mine
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
    
    // Default values for minesweeper game
    const MIN_BET = 200;
    const MAX_BET = 30000;
    const COOLDOWN = 30 * 1000; // 30 seconds
    
    // Game parameters
    const GRID_SIZE = 5; // 5x5 grid
    const NUM_MINES = 5; // 5 mines
    
    // Check if user already has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // If this is a cell reveal request
      const input = m.text.trim().toUpperCase();
      
      // Parse input like "A1", "B3", etc.
      if (/^[A-E][1-5]$/.test(input)) {
        const col = input.charCodeAt(0) - 65; // Convert A-E to 0-4
        const row = parseInt(input.charAt(1)) - 1; // Convert 1-5 to 0-4
        
        // Check if the cell is already revealed
        if (game.revealed[row][col]) {
          return m.reply(lang === 'de' ? 'Dieses Feld wurde bereits aufgedeckt!' : 'This cell has already been revealed!');
        }
        
        // Reveal the cell
        game.revealed[row][col] = true;
        
        // Check if it's a mine
        if (game.board[row][col] === '💣') {
          // Game over - hit a mine
          const loseMessage = getGameTranslation('minesweeper_mine', lang);
          const finalMessage = getGameTranslation('minesweeper_lose', lang, { amount: formatMoney(game.bet) });
          
          // Reveal all mines
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              if (game.board[r][c] === '💣') {
                game.revealed[r][c] = true;
              }
            }
          }
          
          // Display the final board
          const boardDisplay = displayBoard(game.board, game.revealed, lang);
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.minesweeper) {
            user.minesweeper = { wins: 0, losses: 0, total: 0 };
          }
          user.minesweeper.losses = (user.minesweeper.losses || 0) + 1;
          user.minesweeper.total = (user.minesweeper.total || 0) + 1;
          
          // Set cooldown
          user.lastminesweeper = Date.now();
          
          return m.reply(`${boardDisplay}\n\n${loseMessage}\n${finalMessage}`);
        }
        
        // Not a mine, show the content
        const cellContent = game.board[row][col];
        const safeMessage = getGameTranslation('minesweeper_safe', lang, { content: cellContent });
        
        // Check if all safe cells have been revealed
        const totalCells = GRID_SIZE * GRID_SIZE;
        const safeCells = totalCells - NUM_MINES;
        let revealedCount = 0;
        
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (game.revealed[r][c]) revealedCount++;
          }
        }
        
        // Display the updated board
        const boardDisplay = displayBoard(game.board, game.revealed, lang);
        
        // Check if player has won (all safe cells revealed)
        if (revealedCount === safeCells) {
          // Player won!
          const winAmount = game.bet * 3; // 3x bet for winning
          user.money += winAmount;
          
          const winMessage = getGameTranslation('minesweeper_win', lang, { amount: formatMoney(winAmount - game.bet) });
          
          // Reveal all mines
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              if (game.board[r][c] === '💣') {
                game.revealed[r][c] = true;
              }
            }
          }
          
          // Display the final board
          const finalBoardDisplay = displayBoard(game.board, game.revealed, lang);
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.minesweeper) {
            user.minesweeper = { wins: 0, losses: 0, total: 0 };
          }
          user.minesweeper.wins = (user.minesweeper.wins || 0) + 1;
          user.minesweeper.total = (user.minesweeper.total || 0) + 1;
          
          // Set cooldown
          user.lastminesweeper = Date.now();
          
          return m.reply(`${finalBoardDisplay}\n\n${winMessage}`);
        }
        
        // Game continues
        const cellsLeftMessage = getGameTranslation('minesweeper_cells_left', lang, { cells: safeCells - revealedCount });
        const revealMessage = getGameTranslation('minesweeper_reveal', lang);
        
        return m.reply(`${boardDisplay}\n\n${safeMessage}\n${cellsLeftMessage}\n\n${revealMessage}`);
      }
      
      // If not a valid cell coordinate, show the current board
      const boardDisplay = displayBoard(game.board, game.revealed, lang);
      const revealMessage = getGameTranslation('minesweeper_reveal', lang);
      
      return m.reply(`${boardDisplay}\n\n${revealMessage}`);
    }
    
    // Not a continuation of a game, so must be starting a new game
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastminesweeper', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('minesweeper_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Create a new game
    const { board, revealed } = generateMinesweeperBoard(GRID_SIZE, NUM_MINES);
    
    activeGames[m.sender] = {
      board,
      revealed,
      bet: amount,
      startTime: Date.now()
    };
    
    // Set cooldown when game starts (will be updated when game ends)
    user.lastminesweeper = Date.now();
    
    // Display the initial board
    const boardDisplay = displayBoard(board, revealed, lang);
    
    // Send initial message
    const startMessage = getGameTranslation('minesweeper_start', lang);
    const revealMessage = getGameTranslation('minesweeper_reveal', lang);
    
    return m.reply(`${startMessage}\n\n${boardDisplay}\n\n${revealMessage}`);
    
  } catch (e) {
    console.error('Error in minesweeper game:', e);
    return m.reply('Error: ' + e.message);
  }
};

// Generate a minesweeper board
function generateMinesweeperBoard(size, numMines) {
  // Create empty grid
  const board = Array(size).fill().map(() => Array(size).fill('0'));
  const revealed = Array(size).fill().map(() => Array(size).fill(false));
  
  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const row = randomInt(0, size - 1);
    const col = randomInt(0, size - 1);
    
    // Skip if there's already a mine here
    if (board[row][col] === '💣') continue;
    
    // Place a mine
    board[row][col] = '💣';
    minesPlaced++;
    
    // Update adjacent cell numbers
    updateAdjacentCells(board, row, col, size);
  }
  
  return { board, revealed };
}

// Update numbers in cells adjacent to a mine
function updateAdjacentCells(board, row, col, size) {
  // Check all 8 adjacent cells
  for (let r = Math.max(0, row - 1); r <= Math.min(size - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(size - 1, col + 1); c++) {
      // Skip the mine cell itself
      if (r === row && c === col) continue;
      
      // Skip if this cell is also a mine
      if (board[r][c] === '💣') continue;
      
      // Increment the count
      const currentCount = parseInt(board[r][c]);
      board[r][c] = (currentCount + 1).toString();
    }
  }
}

// Format board for display
function displayBoard(board, revealed, lang) {
  const size = board.length;
  
  // Column headers (A-E)
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
        // Show the content for revealed cells
        if (cell === '0') {
          display += ' · '; // Empty cell
        } else {
          // Add color to numbers
          if (cell === '💣') {
            display += ' 💣';
          } else {
            display += ` ${cell} `;
          }
        }
      } else {
        // Hidden cell
        display += ' □ ';
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
  
  // Add title and instructions
  const title = `📋 ${lang === 'de' ? 'MINESWEEPER' : 'MINESWEEPER'} (${lang === 'de' ? 'Minen' : 'Mines'}: 5)`;
  return `┏━━━[ ${title} ]━━━┓\n┃\n${display}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
}

handler.help = ['minesweeper'];
handler.tags = ['game'];
handler.command = /^(minesweeper|mines|mineswp|minesw|minensucher)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
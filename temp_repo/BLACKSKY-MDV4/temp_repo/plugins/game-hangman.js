/**
 * Hangman Game for WhatsApp Bot
 * Classic hangman game where players guess words letter by letter
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
    
    // Default values for hangman game
    const MIN_BET = 200;
    const MAX_BET = 20000;
    const COOLDOWN = 30 * 1000; // 30 seconds after game ends
    const MAX_MISTAKES = 6; // Standard hangman with 6 wrong guesses allowed
    
    // Check if user already has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // If this is a letter guess
      const guess = m.text.trim().toLowerCase();
      
      if (guess.length === 1 && /^[a-z]$/.test(guess)) {
        // Check if letter was already guessed
        if (game.guessedLetters.includes(guess)) {
          return m.reply(getGameTranslation('hangman_already_guessed', lang, { letter: guess }));
        }
        
        // Add to guessed letters
        game.guessedLetters.push(guess);
        
        // Check if the letter is in the word
        const isCorrect = game.word.includes(guess);
        
        // Update displayed word
        if (isCorrect) {
          for (let i = 0; i < game.word.length; i++) {
            if (game.word[i] === guess) {
              game.displayWord[i] = guess;
            }
          }
          
          // Send correct message
          m.reply(getGameTranslation('hangman_correct', lang, { letter: guess }));
        } else {
          // Wrong guess
          game.mistakes++;
          
          // Send incorrect message
          m.reply(getGameTranslation('hangman_incorrect', lang, { letter: guess }));
        }
        
        // Check if word is completely guessed
        const isWordGuessed = !game.displayWord.includes('_');
        
        // Check if out of lives
        const isGameOver = game.mistakes >= MAX_MISTAKES;
        
        // Display the current state
        const hangmanDisplay = getHangmanArt(game.mistakes);
        const displayWordFormatted = game.displayWord.join(' ');
        const guessedLettersFormatted = game.guessedLetters.join(', ');
        const livesLeft = MAX_MISTAKES - game.mistakes;
        
        // Translate display messages
        const displayMessage = getGameTranslation('hangman_display', lang, {
          hangman: hangmanDisplay,
          word: displayWordFormatted,
          guessed: guessedLettersFormatted,
          lives: livesLeft
        });
        
        // Check for win or loss
        if (isWordGuessed) {
          // Player won - calculate winnings based on how many mistakes were made
          const winMultiplier = 1 + ((MAX_MISTAKES - game.mistakes) * 0.2); // More lives left = higher multiplier
          const winAmount = Math.floor(game.bet * winMultiplier);
          user.money += winAmount;
          
          // Send win message
          const winMessage = getGameTranslation('hangman_win', lang, {
            word: game.word,
            amount: formatMoney(winAmount)
          });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.hangman) {
            user.hangman = { wins: 0, losses: 0, total: 0 };
          }
          user.hangman.wins = (user.hangman.wins || 0) + 1;
          user.hangman.total = (user.hangman.total || 0) + 1;
          
          // Set cooldown
          user.lasthangman = Date.now();
          
          return m.reply(`${displayMessage}\n\n${winMessage}`);
        } else if (isGameOver) {
          // Player lost
          const loseMessage = getGameTranslation('hangman_lose', lang, {
            word: game.word,
            amount: formatMoney(game.bet)
          });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.hangman) {
            user.hangman = { wins: 0, losses: 0, total: 0 };
          }
          user.hangman.losses = (user.hangman.losses || 0) + 1;
          user.hangman.total = (user.hangman.total || 0) + 1;
          
          // Set cooldown
          user.lasthangman = Date.now();
          
          return m.reply(`${displayMessage}\n\n${loseMessage}`);
        }
        
        // Game continues
        return m.reply(displayMessage);
      }
      
      // If not a valid letter, show current game state
      const hangmanDisplay = getHangmanArt(game.mistakes);
      const displayWordFormatted = game.displayWord.join(' ');
      const guessedLettersFormatted = game.guessedLetters.join(', ');
      const livesLeft = MAX_MISTAKES - game.mistakes;
      
      // Translate display messages
      const displayMessage = getGameTranslation('hangman_display', lang, {
        hangman: hangmanDisplay,
        word: displayWordFormatted,
        guessed: guessedLettersFormatted,
        lives: livesLeft
      });
      
      return m.reply(displayMessage);
    }
    
    // Not a continuation of a game, so must be starting a new game
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lasthangman', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('hangman_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
    
    // Get a random word based on language
    const word = getRandomWord(lang);
    
    // Create display word with underscores
    const displayWord = Array(word.length).fill('_');
    
    // Create a new game
    activeGames[m.sender] = {
      word,
      displayWord,
      guessedLetters: [],
      mistakes: 0,
      bet: amount,
      startTime: Date.now()
    };
    
    // Set cooldown when game starts (will be updated when game ends)
    user.lasthangman = Date.now();
    
    // Format initial display
    const hangmanDisplay = getHangmanArt(0);
    const displayWordFormatted = displayWord.join(' ');
    const livesLeft = MAX_MISTAKES;
    
    // Translate display messages
    const displayMessage = getGameTranslation('hangman_display', lang, {
      hangman: hangmanDisplay,
      word: displayWordFormatted,
      guessed: lang === 'de' ? 'Keine' : 'None',
      lives: livesLeft
    });
    
    // Send initial message
    const startMessage = getGameTranslation('hangman_start', lang);
    
    return m.reply(`${startMessage}\n\n${displayMessage}\n\n${lang === 'de' ? 'Rate einen Buchstaben!' : 'Guess a letter!'}`);
    
  } catch (e) {
    console.error('Error in hangman game:', e);
    return m.reply('Error: ' + e.message);
  }
};

// Get a random word based on language
function getRandomWord(lang) {
  const englishWords = [
    'apple', 'beach', 'chair', 'dance', 'eagle', 'flower', 'guitar', 'house', 'island', 
    'jacket', 'kitchen', 'lemon', 'monkey', 'night', 'orange', 'pencil', 'quiet', 'river', 
    'summer', 'table', 'umbrella', 'violin', 'winter', 'yellow', 'zebra', 'bread', 'clock',
    'dolphin', 'elephant', 'forest', 'garden', 'hammer', 'ice', 'jungle', 'kite', 'lamp',
    'mountain', 'notebook', 'ocean', 'planet', 'queen', 'rainbow', 'snake', 'tiger',
    'unicorn', 'village', 'window', 'xylophone', 'yacht', 'zeppelin'
  ];
  
  const germanWords = [
    'apfel', 'brot', 'computer', 'dorf', 'eule', 'fenster', 'garten', 'haus', 'insel', 
    'jacke', 'kaffee', 'lampe', 'maus', 'nacht', 'orange', 'papier', 'qualle', 'regen', 
    'sonne', 'tisch', 'uhr', 'vogel', 'wasser', 'xylophon', 'yacht', 'zebra', 'auto',
    'blume', 'domain', 'elefant', 'freund', 'gabel', 'himmel', 'igel', 'jahr', 'katze',
    'lehrer', 'mond', 'nadel', 'obst', 'pferd', 'quelle', 'radio', 'schule', 'tasche',
    'urlaub', 'vater', 'wolke', 'zucker'
  ];
  
  const wordList = lang === 'de' ? germanWords : englishWords;
  return wordList[randomInt(0, wordList.length - 1)];
}

// Get hangman ASCII art based on mistake count
function getHangmanArt(mistakes) {
  const hangmanStages = [
    // 0 mistakes
    `
  +---+
  |   |
      |
      |
      |
      |
=========`,
    // 1 mistake
    `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
    // 2 mistakes
    `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
    // 3 mistakes
    `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
    // 4 mistakes
    `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
    // 5 mistakes
    `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
    // 6 mistakes (game over)
    `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
  ];
  
  return hangmanStages[mistakes];
}

handler.help = ['hangman'];
handler.tags = ['game'];
handler.command = /^(hangman|galgenmaennchen|galgenspiel|galgenmännchen)$/i;
handler.group = true;
handler.register = true;

// Also handle letter inputs for active games
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return false;
  
  // Check if this is a single letter and the player has an active game
  const letter = m.text.trim().toLowerCase();
  if (letter.length === 1 && /^[a-z]$/.test(letter) && activeGames[m.sender]) {
    // This is a valid letter guess for an active game
    await handler(m, { conn, args: [], usedPrefix: '', command: 'hangman' });
    return true; // Handled
  }
  
  return false; // Not handled
};

module.exports = handler;
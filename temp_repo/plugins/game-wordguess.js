/**
 * Word Guessing Game for WhatsApp Bot
 * Guess the hidden word one letter at a time
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
    
    // Default values for word guess game
    const MIN_BET = 200;
    const MAX_BET = 20000;
    const COOLDOWN = 30 * 1000; // 30 seconds after game ends
    const MAX_GUESSES = 8; // Max wrong guesses allowed
    
    // Check if user already has an active game
    if (activeGames[m.sender]) {
      const game = activeGames[m.sender];
      
      // If this is a letter guess
      const guess = m.text.trim().toLowerCase();
      
      if (guess.length === 1 && /^[a-z]$/.test(guess)) {
        // Check if letter was already guessed
        if (game.guessedLetters.includes(guess)) {
          return m.reply(getGameTranslation('wordguess_already_guessed', lang, { letter: guess }));
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
          m.reply(getGameTranslation('wordguess_correct', lang, { letter: guess }));
        } else {
          // Wrong guess
          game.wrongGuesses++;
          
          // Send incorrect message
          m.reply(getGameTranslation('wordguess_incorrect', lang, { letter: guess }));
        }
        
        // Check if word is completely guessed
        const isWordGuessed = !game.displayWord.includes('_');
        
        // Check if out of guesses
        const isGameOver = game.wrongGuesses >= MAX_GUESSES;
        
        // Format display word with spaces
        const displayWordFormatted = game.displayWord.join(' ');
        
        // Format guessed letters
        const guessedLettersFormatted = game.guessedLetters.join(', ');
        
        // Create the word display
        let wordDisplay = `┏━━━[ 🔤 ${lang === 'de' ? 'WORTRATEN' : 'WORD GUESS'} 🔤 ]━━━┓\n┃\n`;
        wordDisplay += `┃   ${lang === 'de' ? 'Wort' : 'Word'}: ${displayWordFormatted}\n`;
        wordDisplay += `┃   ${lang === 'de' ? 'Geratene Buchstaben' : 'Guessed letters'}: ${guessedLettersFormatted}\n`;
        wordDisplay += `┃   ${lang === 'de' ? 'Verbleibende Fehler' : 'Remaining errors'}: ${MAX_GUESSES - game.wrongGuesses}\n`;
        wordDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
        
        // Check for win or loss
        if (isWordGuessed) {
          // Player won
          const winAmount = Math.floor(game.bet * (1 + (MAX_GUESSES - game.wrongGuesses) * 0.2));
          user.money += winAmount;
          
          // Send win message
          const winMessage = getGameTranslation('wordguess_win', lang, {
            word: game.word,
            amount: formatMoney(winAmount)
          });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.wordguess) {
            user.wordguess = { wins: 0, losses: 0, total: 0 };
          }
          user.wordguess.wins = (user.wordguess.wins || 0) + 1;
          user.wordguess.total = (user.wordguess.total || 0) + 1;
          
          // Set cooldown
          user.lastwordguess = Date.now();
          
          return m.reply(`${wordDisplay}\n\n${winMessage}`);
        } else if (isGameOver) {
          // Player lost
          const loseMessage = getGameTranslation('wordguess_lose', lang, {
            word: game.word,
            amount: formatMoney(game.bet)
          });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.wordguess) {
            user.wordguess = { wins: 0, losses: 0, total: 0 };
          }
          user.wordguess.losses = (user.wordguess.losses || 0) + 1;
          user.wordguess.total = (user.wordguess.total || 0) + 1;
          
          // Set cooldown
          user.lastwordguess = Date.now();
          
          return m.reply(`${wordDisplay}\n\n${loseMessage}`);
        }
        
        // Game continues
        return m.reply(wordDisplay);
      }
      
      // If not a letter, show current game state
      const displayWordFormatted = game.displayWord.join(' ');
      const guessedLettersFormatted = game.guessedLetters.join(', ');
      
      let wordDisplay = `┏━━━[ 🔤 ${lang === 'de' ? 'WORTRATEN' : 'WORD GUESS'} 🔤 ]━━━┓\n┃\n`;
      wordDisplay += `┃   ${lang === 'de' ? 'Wort' : 'Word'}: ${displayWordFormatted}\n`;
      wordDisplay += `┃   ${lang === 'de' ? 'Geratene Buchstaben' : 'Guessed letters'}: ${guessedLettersFormatted}\n`;
      wordDisplay += `┃   ${lang === 'de' ? 'Verbleibende Fehler' : 'Remaining errors'}: ${MAX_GUESSES - game.wrongGuesses}\n`;
      wordDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
      
      return m.reply(wordDisplay);
    }
    
    // Not a continuation of a game, so must be starting a new game
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastwordguess', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('wordguess_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
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
      wrongGuesses: 0,
      bet: amount,
      startTime: Date.now()
    };
    
    // Set cooldown when game starts (will be updated when game ends)
    user.lastwordguess = Date.now();
    
    // Format display word with spaces
    const displayWordFormatted = displayWord.join(' ');
    
    // Create the word display
    let wordDisplay = `┏━━━[ 🔤 ${lang === 'de' ? 'WORTRATEN' : 'WORD GUESS'} 🔤 ]━━━┓\n┃\n`;
    wordDisplay += `┃   ${lang === 'de' ? 'Wort' : 'Word'}: ${displayWordFormatted}\n`;
    wordDisplay += `┃   ${lang === 'de' ? 'Geratene Buchstaben' : 'Guessed letters'}: ${lang === 'de' ? 'Keine' : 'None'}\n`;
    wordDisplay += `┃   ${lang === 'de' ? 'Verbleibende Fehler' : 'Remaining errors'}: ${MAX_GUESSES}\n`;
    wordDisplay += `┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Send initial message
    const startMessage = getGameTranslation('wordguess_start', lang);
    
    return m.reply(`${startMessage}\n\n${wordDisplay}\n\n${lang === 'de' ? 'Rate einen Buchstaben!' : 'Guess a letter!'}`);
    
  } catch (e) {
    console.error('Error in word guess game:', e);
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

handler.help = ['wordguess'];
handler.tags = ['game'];
handler.command = /^(wordguess|guessword|word|wordraten|wort|wortraetsel)$/i;
handler.group = true;
handler.register = true;

// Also handle letter inputs for active games
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return false;
  
  // Check if this is a single letter and the player has an active game
  const letter = m.text.trim().toLowerCase();
  if (letter.length === 1 && /^[a-z]$/.test(letter) && activeGames[m.sender]) {
    // This is a valid letter guess for an active game
    await handler(m, { conn, args: [], usedPrefix: '', command: 'wordguess' });
    return true; // Handled
  }
  
  return false; // Not handled
};

module.exports = handler;
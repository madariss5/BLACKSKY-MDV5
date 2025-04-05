/**
 * Game Menu for WhatsApp Bot
 * Shows all available games with descriptions
 */

const { formatMoney } = require('../lib/game-utils');

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Check if user exists in database
    if (!user) {
      return m.reply(lang === 'de' 
        ? 'Du musst zuerst registriert sein um zu spielen. Benutze .reg name|alter'
        : 'You need to register first to play games. Use .reg name|age');
    }
    
    // Create game menu
    let menu = `┏━━━[ 🎮 ${lang === 'de' ? 'SPIELMENÜ' : 'GAME MENU'} 🎮 ]━━━┓\n┃\n`;
    
    // User balance
    menu += `┃ 💰 ${lang === 'de' ? 'Dein Kontostand' : 'Your Balance'}: ${formatMoney(user.money)}\n┃\n`;
    
    // Function to add a game to the menu
    const addGame = (command, name, description, needsBet = true) => {
      menu += `┃ ▸ ${usedPrefix}${command}${needsBet ? ' <bet>' : ''}\n`;
      menu += `┃   ${name}\n`;
      menu += `┃   ${description}\n`;
      menu += `┃\n`;
    };
    
    // Casino games
    menu += `┃ 🎰 ${lang === 'de' ? 'CASINO SPIELE' : 'CASINO GAMES'}\n┃\n`;
    
    addGame('slot', 
      lang === 'de' ? '🎰 Spielautomat' : '🎰 Slot Machine', 
      lang === 'de' ? 'Drehe die Walzen und versuche gleiche Symbole zu bekommen!' : 'Spin the reels and try to match symbols!');
    
    addGame('dice <bet> <hi/lo>', 
      lang === 'de' ? '🎲 Würfelspiel' : '🎲 Dice Game', 
      lang === 'de' ? 'Setze auf hohe (4-6) oder niedrige (1-3) Würfelzahlen.' : 'Bet on high (4-6) or low (1-3) dice rolls.');
    
    addGame('coinflip <bet> <heads/tails>', 
      lang === 'de' ? '🪙 Münzwurf' : '🪙 Coin Flip', 
      lang === 'de' ? 'Setze auf Kopf oder Zahl bei einem Münzwurf.' : 'Bet on heads or tails in a coin flip.');
    
    addGame('roulette <bet> <prediction>', 
      lang === 'de' ? '🎡 Roulette' : '🎡 Roulette', 
      lang === 'de' ? 'Setze auf Zahlen, Farben oder gerade/ungerade.' : 'Bet on numbers, colors, or even/odd.');
    
    addGame('wheel <bet>', 
      lang === 'de' ? '🎡 Glücksrad' : '🎡 Wheel of Fortune', 
      lang === 'de' ? 'Drehe das Rad und gewinne verschiedene Multiplikatoren.' : 'Spin the wheel and win various multipliers.');
    
    addGame('crash <bet>', 
      lang === 'de' ? '📈 Crash' : '📈 Crash', 
      lang === 'de' ? 'Setze und cashe aus, bevor der Multiplier abstürzt!' : 'Bet and cash out before the multiplier crashes!');
    
    addGame('blackjack <bet>', 
      lang === 'de' ? '♠️ Blackjack' : '♠️ Blackjack', 
      lang === 'de' ? 'Spiele Blackjack gegen den Dealer. Näher an 21 kommen!' : 'Play blackjack against the dealer. Get closer to 21!');
    
    addGame('keno <bet> <numbers>', 
      lang === 'de' ? '🎲 Keno' : '🎲 Keno', 
      lang === 'de' ? 'Wähle bis zu 10 Zahlen und sehe, wie viele übereinstimmen.' : 'Pick up to 10 numbers and see how many match.');
    
    addGame('scratch <bet>', 
      lang === 'de' ? '🎫 Rubbellos' : '🎫 Scratch Card', 
      lang === 'de' ? 'Kaufe ein Rubbellos und versuche Symbole zu kombinieren.' : 'Buy a scratch card and try to match symbols.');
    
    addGame('bingo <bet>', 
      lang === 'de' ? '🎯 Bingo' : '🎯 Bingo', 
      lang === 'de' ? 'Klassisches Bingo! Markiere Zahlen, wenn sie aufgerufen werden.' : 'Classic bingo! Mark numbers as they are called.');
    
    // Card games
    menu += `┃ 🃏 ${lang === 'de' ? 'KARTENSPIELE' : 'CARD GAMES'}\n┃\n`;
    
    addGame('cardwar <bet>', 
      lang === 'de' ? '🃏 Kartenkrieg' : '🃏 Card War', 
      lang === 'de' ? 'Einfaches Kartenspiel - höhere Karte gewinnt!' : 'Simple card game - higher card wins!');
    
    addGame('highlow <bet> <higher/lower>', 
      lang === 'de' ? '⬆️⬇️ Höher oder Tiefer' : '⬆️⬇️ Higher or Lower', 
      lang === 'de' ? 'Rate, ob die nächste Karte höher oder tiefer ist.' : 'Guess if the next card will be higher or lower.');
    
    // Skill games
    menu += `┃ 🧠 ${lang === 'de' ? 'GESCHICKLICHKEITSSPIELE' : 'SKILL GAMES'}\n┃\n`;
    
    addGame('rps <bet> <rock/paper/scissors>', 
      lang === 'de' ? '✂️ Schere, Stein, Papier' : '✂️ Rock Paper Scissors', 
      lang === 'de' ? 'Spiele Schere, Stein, Papier gegen den Bot.' : 'Play rock paper scissors against the bot.');
    
    addGame('memory <bet>', 
      lang === 'de' ? '🧠 Memory-Spiel' : '🧠 Memory Game', 
      lang === 'de' ? 'Finde passende Paare von Symbolen in einem Gitter.' : 'Match pairs of symbols in a grid.');
    
    addGame('minesweeper <bet>', 
      lang === 'de' ? '💣 Minesweeper' : '💣 Minesweeper', 
      lang === 'de' ? 'Decke Felder auf, ohne auf Minen zu treffen.' : 'Reveal cells without hitting mines.');
    
    addGame('towers <bet>', 
      lang === 'de' ? '🏢 Turmbesteigung' : '🏢 Tower Climb', 
      lang === 'de' ? 'Besteige den Turm, indem du sichere Pfade wählst.' : 'Climb the tower by choosing safe paths.');
    
    addGame('horserace <bet> <horse number>', 
      lang === 'de' ? '🏇 Pferderennen' : '🏇 Horse Race', 
      lang === 'de' ? 'Setze auf ein Pferd und schaue, wie das Rennen endet.' : 'Bet on a horse and watch the race unfold.');
    
    // Word games
    menu += `┃ 🔤 ${lang === 'de' ? 'WORTSPIELE' : 'WORD GAMES'}\n┃\n`;
    
    addGame('wordguess <bet>', 
      lang === 'de' ? '🔤 Wortraten' : '🔤 Word Guess', 
      lang === 'de' ? 'Rate ein verstecktes Wort Buchstabe für Buchstabe.' : 'Guess a hidden word letter by letter.');
    
    addGame('hangman <bet>', 
      lang === 'de' ? '👨‍🎨 Galgenmännchen' : '👨‍🎨 Hangman', 
      lang === 'de' ? 'Klassisches Galgenmännchen. Rate das Wort rechtzeitig!' : 'Classic hangman. Guess the word before it\'s too late!');
    
    addGame('numguess <bet>', 
      lang === 'de' ? '🔢 Zahlenraten' : '🔢 Number Guess', 
      lang === 'de' ? 'Rate eine Zahl zwischen 1 und 100.' : 'Guess a number between 1 and 100.');
    
    // Statistics
    menu += `┃ 📊 ${lang === 'de' ? 'STATISTIKEN' : 'STATISTICS'}\n┃\n`;
    
    addGame('gamestats', 
      lang === 'de' ? '📊 Spielstatistiken' : '📊 Game Statistics', 
      lang === 'de' ? 'Zeige deine Spielstatistiken und Erfolge an.' : 'View your game statistics and achievements.', 
      false);
    
    // Finish menu
    menu += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Send the menu
    return m.reply(menu);
    
  } catch (e) {
    console.error('Error in game menu:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['gamemenu'];
handler.tags = ['game'];
handler.command = /^(gamemenu|gamesmenu|menugame|menugames|games|spiele|spielmenu|spielemenü)$/i;
handler.register = true;

module.exports = handler;
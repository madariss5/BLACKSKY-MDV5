/**
 * Game Translations
 * Contains translations for all game-related messages
 */

// Translation strings for all games
const translations = {
  // General game messages
  game_cooldown: {
    en: '❄️ Please wait {time} before playing again.',
    de: '❄️ Bitte warte {time}, bevor du erneut spielst.'
  },
  game_invalid_bet: {
    en: '❌ Please enter a valid bet amount between {min} and {max}.',
    de: '❌ Bitte gib einen gültigen Einsatz zwischen {min} und {max} ein.'
  },
  game_bet_too_small: {
    en: '❌ Minimum bet is {amount}.',
    de: '❌ Mindesteinsatz ist {amount}.'
  },
  game_bet_too_large: {
    en: '❌ Maximum bet is {amount}.',
    de: '❌ Maximaleinsatz ist {amount}.'
  },
  game_not_enough_money: {
    en: '❌ You don\'t have enough money to bet {amount}.',
    de: '❌ Du hast nicht genug Geld um {amount} zu setzen.'
  },
  game_balance: {
    en: '💰 Your balance: {balance}',
    de: '💰 Dein Kontostand: {balance}'
  },
  
  // Bingo game translations
  bingo_usage: {
    en: '❓ Usage: {prefix}bingo <bet>',
    de: '❓ Verwendung: {prefix}bingo <Einsatz>'
  },
  bingo_start: {
    en: '🎯 Bingo game started! Your card:',
    de: '🎯 Bingo-Spiel gestartet! Deine Karte:'
  },
  bingo_card: {
    en: '🎫 Your card:\n{card}',
    de: '🎫 Deine Karte:\n{card}'
  },
  bingo_next: {
    en: '🔢 Number drawn: {number}',
    de: '🔢 Gezogene Zahl: {number}'
  },
  bingo_match: {
    en: '✅ Match found on your card!',
    de: '✅ Übereinstimmung auf deiner Karte gefunden!'
  },
  bingo_no_match: {
    en: '❌ No match on your card.',
    de: '❌ Keine Übereinstimmung auf deiner Karte.'
  },
  bingo_numbers_left: {
    en: '⏳ {count} more numbers to be drawn.',
    de: '⏳ {count} weitere Zahlen werden gezogen.'
  },
  bingo_win: {
    en: '🎉 BINGO! You won {amount}!',
    de: '🎉 BINGO! Du hast {amount} gewonnen!'
  },
  bingo_lose: {
    en: '💸 Game over! You lost {amount}.',
    de: '💸 Spielende! Du hast {amount} verloren.'
  },
  
  // Keno game translations
  keno_usage: {
    en: '❓ Usage: {prefix}keno <bet> <numbers>\nPick 1-10 numbers between 1-80.',
    de: '❓ Verwendung: {prefix}keno <Einsatz> <Zahlen>\nWähle 1-10 Zahlen zwischen 1-80.'
  },
  keno_start: {
    en: '🎲 Keno game started!',
    de: '🎲 Keno-Spiel gestartet!'
  },
  keno_picks: {
    en: '🔢 You picked: {picks}',
    de: '🔢 Du hast gewählt: {picks}'
  },
  keno_drawing: {
    en: '🎯 Drawing 20 numbers...',
    de: '🎯 20 Zahlen werden gezogen...'
  },
  keno_drawn: {
    en: '📊 Numbers drawn: {numbers}',
    de: '📊 Gezogene Zahlen: {numbers}'
  },
  keno_matches: {
    en: '🎯 You matched {count} number(s)!',
    de: '🎯 Du hast {count} Zahl(en) getroffen!'
  },
  keno_win: {
    en: '🎉 Congratulations! You won {amount}!',
    de: '🎉 Glückwunsch! Du hast {amount} gewonnen!'
  },
  keno_lose: {
    en: '💸 Sorry! You lost {amount}.',
    de: '💸 Leider! Du hast {amount} verloren.'
  },
  keno_invalid_picks: {
    en: '❌ Please pick 1-10 unique numbers between 1-80.',
    de: '❌ Bitte wähle 1-10 einzigartige Zahlen zwischen 1-80.'
  },
  
  // Memory game translations
  memory_usage: {
    en: '❓ Usage: {prefix}memory <bet>',
    de: '❓ Verwendung: {prefix}memory <Einsatz>'
  },
  memory_start: {
    en: '🧠 Memory game started! Find all matching pairs!',
    de: '🧠 Memory-Spiel gestartet! Finde alle passenden Paare!'
  },
  memory_moves: {
    en: '🔢 Moves left: {moves}',
    de: '🔢 Verbleibende Züge: {moves}'
  },
  memory_select: {
    en: '🎮 Enter two positions to reveal (e.g. A1 B3)',
    de: '🎮 Gib zwei Positionen zum Aufdecken ein (z.B. A1 B3)'
  },
  memory_match: {
    en: '✅ Match found! ({symbol})',
    de: '✅ Übereinstimmung gefunden! ({symbol})'
  },
  memory_no_match: {
    en: '❌ No match found!',
    de: '❌ Keine Übereinstimmung gefunden!'
  },
  memory_win: {
    en: '🎉 Congratulations! You found all pairs and won {amount}!',
    de: '🎉 Glückwunsch! Du hast alle Paare gefunden und {amount} gewonnen!'
  },
  memory_lose: {
    en: '💸 Game over! Out of moves. You lost {amount}.',
    de: '💸 Spielende! Keine Züge mehr. Du hast {amount} verloren.'
  },
  
  // Blackjack game translations
  blackjack_usage: {
    en: '❓ Usage: {prefix}blackjack <bet>',
    de: '❓ Verwendung: {prefix}blackjack <Einsatz>'
  },
  blackjack_start: {
    en: '♠️ Blackjack game started!',
    de: '♠️ Blackjack-Spiel gestartet!'
  },
  blackjack_player_hand: {
    en: '🎮 Your hand: {cards} = {total}',
    de: '🎮 Deine Hand: {cards} = {total}'
  },
  blackjack_dealer_hand: {
    en: '🤖 Dealer\'s hand: {cards} = {total}',
    de: '🤖 Hand des Dealers: {cards} = {total}'
  },
  blackjack_dealer_first_card: {
    en: '🤖 Dealer\'s first card: {card}',
    de: '🤖 Erste Karte des Dealers: {card}'
  },
  blackjack_hit_or_stand: {
    en: '❓ Type "hit" to draw another card or "stand" to hold.',
    de: '❓ Tippe "hit" um eine weitere Karte zu ziehen oder "stand" zum Halten.'
  },
  blackjack_player_hit: {
    en: '🎮 You drew: {card}',
    de: '🎮 Du hast gezogen: {card}'
  },
  blackjack_player_bust: {
    en: '💥 Bust! Your total exceeded 21. You lost {amount}.',
    de: '💥 Bust! Deine Summe hat 21 überschritten. Du hast {amount} verloren.'
  },
  blackjack_dealer_hit: {
    en: '🤖 Dealer drew: {card}',
    de: '🤖 Dealer zieht: {card}'
  },
  blackjack_dealer_bust: {
    en: '💥 Dealer bust! Dealer\'s total exceeded 21. You won {amount}!',
    de: '💥 Dealer bust! Die Summe des Dealers hat 21 überschritten. Du hast {amount} gewonnen!'
  },
  blackjack_player_win: {
    en: '🎉 You win! Your {playerTotal} beats dealer\'s {dealerTotal}. You won {amount}!',
    de: '🎉 Du gewinnst! Deine {playerTotal} schlägt die {dealerTotal} des Dealers. Du hast {amount} gewonnen!'
  },
  blackjack_dealer_win: {
    en: '💸 Dealer wins! Dealer\'s {dealerTotal} beats your {playerTotal}. You lost {amount}.',
    de: '💸 Dealer gewinnt! Die {dealerTotal} des Dealers schlägt deine {playerTotal}. Du hast {amount} verloren.'
  },
  blackjack_push: {
    en: '🤝 Push! Both you and the dealer have {total}. Your bet is returned.',
    de: '🤝 Unentschieden! Du und der Dealer haben beide {total}. Dein Einsatz wird zurückgegeben.'
  },
  blackjack_natural: {
    en: '🎯 Blackjack! You got a natural 21 and won {amount}!',
    de: '🎯 Blackjack! Du hast ein natürliches 21 und {amount} gewonnen!'
  },
  
  // Slot machine translations
  slot_usage: {
    en: '❓ Usage: {prefix}slot <bet>',
    de: '❓ Verwendung: {prefix}slot <Einsatz>'
  },
  slot_spinning: {
    en: '🎰 Spinning the slots...',
    de: '🎰 Drehe die Walzen...'
  },
  slot_win: {
    en: '🎉 You won {amount}!',
    de: '🎉 Du hast {amount} gewonnen!'
  },
  slot_lose: {
    en: '💸 You lost {amount}.',
    de: '💸 Du hast {amount} verloren.'
  },
  slot_jackpot: {
    en: '💰 JACKPOT! You won {amount}!',
    de: '💰 JACKPOT! Du hast {amount} gewonnen!'
  },
  
  // Dice game translations
  dice_usage: {
    en: '❓ Usage: {prefix}dice <bet> <hi/lo>',
    de: '❓ Verwendung: {prefix}dice <Einsatz> <hi/lo>'
  },
  dice_invalid_choice: {
    en: '❌ Please choose either "hi" (4-6) or "lo" (1-3).',
    de: '❌ Bitte wähle entweder "hi" (4-6) oder "lo" (1-3).'
  },
  dice_rolling: {
    en: '🎲 Rolling the dice...',
    de: '🎲 Würfle...'
  },
  dice_result: {
    en: '🎲 You rolled: {result}',
    de: '🎲 Du hast gewürfelt: {result}'
  },
  dice_win: {
    en: '🎉 You win! You bet on {choice} and rolled {result}. You won {amount}!',
    de: '🎉 Du gewinnst! Du hast auf {choice} gesetzt und {result} gewürfelt. Du hast {amount} gewonnen!'
  },
  dice_lose: {
    en: '💸 You lose! You bet on {choice} but rolled {result}. You lost {amount}.',
    de: '💸 Du verlierst! Du hast auf {choice} gesetzt, aber {result} gewürfelt. Du hast {amount} verloren.'
  },
  
  // Coinflip game translations
  coinflip_usage: {
    en: '❓ Usage: {prefix}coinflip <bet> <heads/tails>',
    de: '❓ Verwendung: {prefix}coinflip <Einsatz> <heads/tails>'
  },
  coinflip_invalid_choice: {
    en: '❌ Please choose either "heads" or "tails".',
    de: '❌ Bitte wähle entweder "heads" (Kopf) oder "tails" (Zahl).'
  },
  coinflip_flipping: {
    en: '🪙 Flipping the coin...',
    de: '🪙 Werfe die Münze...'
  },
  coinflip_result: {
    en: '🪙 Result: {result}',
    de: '🪙 Ergebnis: {result}'
  },
  coinflip_win: {
    en: '🎉 You win! The coin landed on {result}. You won {amount}!',
    de: '🎉 Du gewinnst! Die Münze zeigt {result}. Du hast {amount} gewonnen!'
  },
  coinflip_lose: {
    en: '💸 You lose! The coin landed on {result}. You lost {amount}.',
    de: '💸 Du verlierst! Die Münze zeigt {result}. Du hast {amount} verloren.'
  },
  
  // Rock Paper Scissors game translations
  rps_usage: {
    en: '❓ Usage: {prefix}rps <bet> <rock/paper/scissors>',
    de: '❓ Verwendung: {prefix}rps <Einsatz> <stein/papier/schere>'
  },
  rps_invalid_choice: {
    en: '❌ Please choose either "rock", "paper", or "scissors".',
    de: '❌ Bitte wähle entweder "stein", "papier" oder "schere".'
  },
  rps_thinking: {
    en: '🤔 Thinking of my move...',
    de: '🤔 Ich überlege meinen Zug...'
  },
  rps_player_choice: {
    en: '👤 You chose: {choice}',
    de: '👤 Du hast gewählt: {choice}'
  },
  rps_bot_choice: {
    en: '🤖 Bot chose: {choice}',
    de: '🤖 Bot hat gewählt: {choice}'
  },
  rps_win: {
    en: '🎉 You win! {playerChoice} beats {botChoice}. You won {amount}!',
    de: '🎉 Du gewinnst! {playerChoice} schlägt {botChoice}. Du hast {amount} gewonnen!'
  },
  rps_lose: {
    en: '💸 You lose! {botChoice} beats {playerChoice}. You lost {amount}.',
    de: '💸 Du verlierst! {botChoice} schlägt {playerChoice}. Du hast {amount} verloren.'
  },
  rps_tie: {
    en: '🤝 It\'s a tie! Both chose {choice}. Your bet is returned.',
    de: '🤝 Unentschieden! Beide haben {choice} gewählt. Dein Einsatz wird zurückgegeben.'
  },
  rps_result: {
    en: '🎮 Game Result:\n\nYou chose: {playerChoice}\nBot chose: {botChoice}\n\n{outcome}',
    de: '🎮 Spielergebnis:\n\nDu hast gewählt: {playerChoice}\nBot hat gewählt: {botChoice}\n\n{outcome}'
  },
  
  // Roulette game translations
  roulette_usage: {
    en: '❓ Usage: {prefix}roulette <bet> <prediction>\nYou can bet on:\n- Single number (0-36)\n- Color (red/black)\n- Even/Odd\n- Low (1-18)/High (19-36)',
    de: '❓ Verwendung: {prefix}roulette <Einsatz> <Vorhersage>\nDu kannst setzen auf:\n- Einzelne Zahl (0-36)\n- Farbe (red/black)\n- Gerade/Ungerade (even/odd)\n- Niedrig (1-18)/Hoch (19-36) (low/high)'
  },
  roulette_invalid_prediction: {
    en: '❌ Invalid prediction. Please bet on a number (0-36), color (red/black), even/odd, or low/high.',
    de: '❌ Ungültige Vorhersage. Bitte setze auf eine Zahl (0-36), Farbe (red/black), gerade/ungerade (even/odd) oder niedrig/hoch (low/high).'
  },
  roulette_spinning: {
    en: '🎡 Spinning the roulette wheel...',
    de: '🎡 Drehe das Roulette-Rad...'
  },
  roulette_result: {
    en: '🎯 The ball landed on {number} {color}',
    de: '🎯 Die Kugel ist auf {number} {color} gelandet'
  },
  roulette_win_number: {
    en: '🎉 You win! The ball landed on {result}. You won {amount}!',
    de: '🎉 Du gewinnst! Die Kugel ist auf {result} gelandet. Du hast {amount} gewonnen!'
  },
  roulette_win_color: {
    en: '🎉 You win! The ball landed on {number} {color}. You won {amount}!',
    de: '🎉 Du gewinnst! Die Kugel ist auf {number} {color} gelandet. Du hast {amount} gewonnen!'
  },
  roulette_win_parity: {
    en: '🎉 You win! {number} is {parity}. You won {amount}!',
    de: '🎉 Du gewinnst! {number} ist {parity}. Du hast {amount} gewonnen!'
  },
  roulette_win_range: {
    en: '🎉 You win! {number} is in the {range} range. You won {amount}!',
    de: '🎉 Du gewinnst! {number} ist im Bereich {range}. Du hast {amount} gewonnen!'
  },
  roulette_lose: {
    en: '💸 You lose! The ball landed on {number} {color}. You lost {amount}.',
    de: '💸 Du verlierst! Die Kugel ist auf {number} {color} gelandet. Du hast {amount} verloren.'
  }
};

/**
 * Get translation for a specific key
 * @param {string} key - Translation key
 * @param {string} lang - Language code (en or de)
 * @param {Object} vars - Variables to interpolate in the translation string
 * @returns {string} - Translated string with interpolated variables
 */
function getGameTranslation(key, lang = 'en', vars = {}) {
  // Default to English if the language is not supported
  if (lang !== 'en' && lang !== 'de') {
    lang = 'en';
  }
  
  // Get the translation object for the key
  const translationObj = translations[key];
  
  // If translation doesn't exist, return a fallback message
  if (!translationObj) {
    return `[Missing translation: ${key}]`;
  }
  
  // Get the translation string for the specified language
  let translationStr = translationObj[lang];
  
  // If the translation for the specified language doesn't exist, fall back to English
  if (!translationStr) {
    translationStr = translationObj.en || `[Missing translation: ${key}.${lang}]`;
  }
  
  // Replace variables in the translation string
  if (vars && typeof vars === 'object') {
    for (const [key, value] of Object.entries(vars)) {
      translationStr = translationStr.replace(new RegExp(`{${key}}`, 'g'), value);
    }
  }
  
  return translationStr;
}

module.exports = {
  getGameTranslation
};
/**
 * TicTacToe Game Translations
 * Contains translations for TicTacToe game messages
 */

// Translation strings for TicTacToe game
const translations = {
  // TicTacToe game translations
  ttt_already_playing: {
    en: "You're already in a TicTacToe game!",
    de: "Du bist bereits in einem TicTacToe-Spiel!"
  },
  ttt_partner_found: {
    en: "Partner found!",
    de: "Partner gefunden!"
  },
  ttt_waiting_for_turn: {
    en: "Waiting for @%player% to play",
    de: "Warte auf @%player% zum Spielen"
  },
  ttt_surrender: {
    en: "Type *surrender* to surrender",
    de: "Tippe *surrender* um aufzugeben"
  },
  ttt_waiting_partner: {
    en: "Waiting for partner...",
    de: "Warte auf Partner..."
  },
  ttt_custom_room: {
    en: "Type %prefix%%command% %room% to join this custom room",
    de: "Tippe %prefix%%command% %room% um diesem benutzerdefinierten Raum beizutreten"
  },
  ttt_win: {
    en: "You win!",
    de: "Du gewinnst!"
  },
  ttt_lose: {
    en: "You lose!",
    de: "Du verlierst!"
  },
  ttt_draw: {
    en: "Game ended in a draw!",
    de: "Spiel endete unentschieden!"
  },
  ttt_invalid_position: {
    en: "Invalid position",
    de: "Ungültige Position"
  },
  ttt_room_not_found: {
    en: "Room not found",
    de: "Raum nicht gefunden"
  }
};

/**
 * Get translation for a specific key
 * @param {string} key - Translation key
 * @param {string} lang - Language code (en or de)
 * @param {Object} vars - Variables to interpolate in the translation string
 * @returns {string} - Translated string with interpolated variables
 */
function getTTTTranslation(key, lang = 'en', vars = {}) {
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
      translationStr = translationStr.replace(new RegExp(`%${key}%`, 'g'), value);
    }
  }
  
  return translationStr;
}

module.exports = {
  getTTTTranslation
};
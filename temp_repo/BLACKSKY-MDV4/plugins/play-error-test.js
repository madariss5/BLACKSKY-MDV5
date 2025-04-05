/**
 * Play Error Test Command
 * This command tests the play_error translation key functionality
 * in both English and German language settings.
 */

const { getMessage } = require('../lib/languages');

let handler = async (m, { conn, text }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || 'en';
  
  try {
    // Force an error to test the error message
    throw new Error('Test error for play_error translation');
  } catch (e) {
    // Get the play_error message in the user's language
    const errorMessage = getMessage('play_error', lang).replace('%error%', e.message);
    
    // Reply with language info and the error message
    const currentLang = lang === 'en' ? 'English' : 'German';
    const message = `Current language: ${currentLang}\n\n${errorMessage}`;
    
    conn.reply(m.chat, message, m);
  }
};

handler.help = ['play_error'];
handler.tags = ['test'];
handler.command = /^(play_error)$/i;

module.exports = handler;
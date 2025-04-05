/**
 * Kiss Command (German Version) - Displays kiss animation with translated messages
 * This is a German language command that maps to the "kiss" reaction
 */

const { createReactionHandler } = require('../lib/createReactionHandler');
const { languages } = require('../lib/languages');

// German to English command mapping for the handler
const handler = createReactionHandler('kiss');

// Add German command alias
handler.help = ['kuss', 'küssen'];
handler.tags = ['reactions', 'fun', 'deutsch'];
handler.command = /^(kuss|küssen)$/i;

module.exports = handler;
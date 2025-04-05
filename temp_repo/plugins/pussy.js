/**
 * NSFW Pussy Command
 * Shows NSFW pussy images (requires .nsfw on in groups)
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');
const { getMessage } = require('../lib/languages.js');

const handler = createNsfwHandler('pussy');

handler.help = ['pussy'];
handler.tags = ['nsfw'];
handler.command = /^(pussy|vagina)$/i;

// Only allow in private chats or groups with nsfw enabled
handler.nsfw = true;

module.exports = handler;
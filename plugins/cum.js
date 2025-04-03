/**
 * NSFW Cum Command
 * Shows NSFW cum images (requires .nsfw on in groups)
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');
const { getMessage } = require('../lib/languages.js');

const handler = createNsfwHandler('cum');

handler.help = ['cum'];
handler.tags = ['nsfw'];
handler.command = /^(cum|cumshot)$/i;

// Only allow in private chats or groups with nsfw enabled
handler.nsfw = true;

module.exports = handler;
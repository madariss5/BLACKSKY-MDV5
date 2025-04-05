/**
 * NSFW Neko Command
 * Shows NSFW catgirl (neko) images (requires .nsfw on in groups)
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');
const { getMessage } = require('../lib/languages.js');

const handler = createNsfwHandler('neko');

handler.help = ['neko'];
handler.tags = ['nsfw'];
handler.command = /^(neko|catgirl)$/i;

// Only allow in private chats or groups with nsfw enabled
handler.nsfw = true;

module.exports = handler;
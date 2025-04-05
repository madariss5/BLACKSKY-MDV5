/**
 * NSFW Lingerie Command
 * Shows lingerie images in NSFW-enabled chats
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');

let handler = createNsfwHandler('lingerie');

handler.help = ['lingerie', 'underwear'];
handler.tags = ['nsfw'];
handler.command = /^(lingerie|underwear)$/i;

module.exports = handler;
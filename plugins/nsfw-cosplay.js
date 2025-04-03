/**
 * NSFW Cosplay Command
 * Shows cosplay images in NSFW-enabled chats
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');

let handler = createNsfwHandler('cosplay');

handler.help = ['cosplay', 'lewd-cosplay'];
handler.tags = ['nsfw'];
handler.command = /^(cosplay|lewd-cosplay)$/i;

module.exports = handler;
/**
 * NSFW Uniform Command
 * Shows uniform images in NSFW-enabled chats
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');

let handler = createNsfwHandler('uniform');

handler.help = ['uniform', 'schooluniform'];
handler.tags = ['nsfw'];
handler.command = /^(uniform|schooluniform)$/i;

module.exports = handler;
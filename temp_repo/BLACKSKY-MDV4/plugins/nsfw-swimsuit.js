/**
 * NSFW Swimsuit Command
 * Shows swimsuit images in NSFW-enabled chats
 */

const { createNsfwHandler } = require('../lib/nsfwHelper');

let handler = createNsfwHandler('swimsuit');

handler.help = ['swimsuit', 'bikini'];
handler.tags = ['nsfw'];
handler.command = /^(swimsuit|bikini)$/i;

module.exports = handler;
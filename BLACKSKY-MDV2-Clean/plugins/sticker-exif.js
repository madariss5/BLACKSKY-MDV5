const { getMessage } = require('../lib/languages');

var {
        format
} = require("util");
var {
        Image
} = require("node-webpmux");

var handler = async (m) => {
        if (!m.quoted) return m.reply(getMessage('tag_sticker', m.lang || global.language))
        if (/sticker/.test(m.quoted.mtype)) {
                var image = new Image()
                await image.load(await m.quoted.download())
                m.reply(format(JSON.parse(image.exif.slice(22).toString())))
        }
};
handler.command = handler.help = ['getexif'];
handler.tags = ['sticker'];
module.exports = handler;

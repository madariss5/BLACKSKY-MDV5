const { getMessage } = require('../lib/languages');

let handler = async (m, {
        conn,
        args
}) => {
        if (!args[0] || isNaN(args[0])) {
                throw '*Example*: .buydefense 100';
        }

        /*conn.sendMessage(m.chat, {
                react: {
                        text: '✅',
                        key: m.key,
                }
        })*/

        let count = parseInt(args[0]);
        let hrg = 50000;
        let price = count * hrg;
        let users = global.db.data.users;
        let user = users[m.sender];
        if (price > user.money) {
                throw `Sorry, you don't have enough money to buy ${count} defense. The price for 1 defense is ${hrg} money.\n\nYou need ${price} money.`;
        }
        user.money -= price;
        user.defense += count;
        conn.reply(m.chat, `Successfully purchased ${count} defense for ${price} money.`, m);
}

handler.help = ['buydefense <amount>'];
handler.tags = ['rpg'];
handler.command = /^buydefense$/i;
handler.register = true;
handler.rpg = true

module.exports = handler;
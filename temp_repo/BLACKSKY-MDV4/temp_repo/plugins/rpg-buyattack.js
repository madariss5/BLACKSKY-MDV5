const { getMessage } = require('../lib/languages');

let handler = async (m, {
        conn,
        args
}) => {
        if (!args[0] || isNaN(args[0])) {
                throw '*Example*: .buyattack 100';
        }

        /*conn.sendMessage(m.chat, {
                react: {
                        text: '✅',
                        key: m.key,
                }
        })*/

        let count = parseInt(args[0]);
        let basePrice = 50000; // Base price per unit (was 'hrg' - Indonesian for price)
        let price = count * basePrice;
        let users = global.db.data.users;
        let user = users[m.sender];
        if (price > user.money) {
                throw `Sorry, you don't have enough money to buy ${count} attack. The price of 1 attack is ${basePrice} money.\n\nYou need ${price} Money.`;
        }
        user.money -= price;
        user.attack += count;
        conn.reply(m.chat, `Successfully bought ${count} attack for ${price} money.`, m);
}

handler.help = ['buyattack <amount>'];
handler.tags = ['rpg'];
handler.command = /^buyattack$/i;
handler.rpg = true;
handler.register = true;

module.exports = handler;
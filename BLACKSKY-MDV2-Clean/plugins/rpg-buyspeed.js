const { getMessage } = require('../lib/languages');

let handler = async (m, {
	conn,
	args
}) => {
	if (!args[0] || isNaN(args[0])) {
		throw '*Example*: .buyspeed 100';
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
		throw `Sorry, money you not enough untuk membuy ${count} speed. Harga 1 speed adalah ${hrg} money.\n\nMemrequirekan ${price} Money.`;
	}
	user.money -= price;
	user.speed += count;
	conn.reply(m.chat, `Success membuy ${count} speed dengan harga ${price} money.`, m);
}

handler.help = ['buyspeed <amount>'];
handler.tags = ['rpg'];
handler.command = /^buyspeed$/i;
handler.register = true;
handler.rpg = true;

module.exports = handler;
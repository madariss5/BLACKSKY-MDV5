const { getMessage } = require('../lib/languages');

let handler = async (m, {
	conn,
	args
}) => {
	if (!args[0] || isNaN(args[0])) {
		throw '*Example*: .buystrenght 100';
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
		throw `Sorry, money you not enough untuk membuy ${count} strenght. Harga 1 strenght adalah ${hrg} money.\n\nMemrequirekan ${price} Money.`;
	}
	user.money -= price;
	user.strenght += count;
	conn.reply(m.chat, `Success membuy ${count} strenght dengan harga ${price} money.`, m);
}

handler.help = ['buystrenght <amount>'];
handler.tags = ['rpg'];
handler.command = /^buystrenght$/i;
handler.register = true;
handler.rpg = true;

module.exports = handler;
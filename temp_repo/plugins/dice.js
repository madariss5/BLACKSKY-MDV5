const { getMessage } = require('../lib/languages');

/**
 * Dice Roll Game Command
 * Roll custom dice, like 2d6 (2 six-sided dice)
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    // Default: 1d6 (one 6-sided die)
    let [count, sides] = (text || '1d6').split('d').map(x => parseInt(x));
    
    // Validate inputs
    if (isNaN(count) || isNaN(sides)) {
        return conn.reply(m.chat, `Invalid format. Use ${usedPrefix}${command} <count>d<sides>\nExample: ${usedPrefix}${command} 2d6 to roll two 6-sided dice`, m);
    }
    
    // Enforce reasonable limits
    count = Math.min(100, Math.max(1, count)); // 1-100 dice
    sides = Math.min(1000, Math.max(2, sides)); // 2-1000 sides per die
    
    // Roll the dice
    const results = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        results.push(roll);
        total += roll;
    }
    
    // Create a visually appealing dice display
    const dice = [
        '⚀', '⚁', '⚂', '⚃', '⚄', '⚅' // Unicode dice faces (for d6 only)
    ];
    
    // Generate dice emojis for d6, otherwise show numbers
    const resultDisplay = sides === 6 && count <= 5
        ? results.map(r => dice[r-1]).join(' ')
        : results.join(', ');
    
    // Format the message
    const message = `
🎲 *Dice Roll: ${count}d${sides}*
${sides === 6 && count <= 5 ? resultDisplay : `Results: ${resultDisplay}`}
Total: ${total}
${count > 1 ? `Average: ${(total / count).toFixed(2)}` : ''}
`;
    
    // Send the result
    await conn.reply(m.chat, message, m);
};

handler.help = ['dice [count]d[sides]'];
handler.tags = ['game', 'fun'];
handler.command = /^(dice|roll)$/i;

}

module.exports = handler;
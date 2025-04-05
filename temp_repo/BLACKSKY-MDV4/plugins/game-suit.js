const { getMessage } = require('../lib/languages');

let handler = async (m, { text, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    // Map input text to styourdized values based on language
    const getChoice = (input) => {
        const lowerInput = input.toLowerCase();
        // Normalize inputs across languages
        if (lowerInput === 'stone' || lowerInput === 'rock' || lowerInput === 'stein' || lowerInput === getMessage('suit_rock', lang))
            return 'rock';
        if (lowerInput === 'kertas' || lowerInput === 'paper' || lowerInput === 'papier' || lowerInput === getMessage('suit_paper', lang))
            return 'paper';
        if (lowerInput === 'gunting' || lowerInput === 'scissors' || lowerInput === 'schere' || lowerInput === getMessage('suit_scissors', lang))
            return 'scissors';
        return null;
    };
    
    // Get display name for choices
    const getDisplayName = (choice) => {
        if (choice === 'rock') return getMessage('suit_rock', lang);
        if (choice === 'paper') return getMessage('suit_paper', lang);
        if (choice === 'scissors') return getMessage('suit_scissors', lang);
        return choice;
    };
    
    if (!text) throw getMessage('suit_options', lang, { prefix: usedPrefix });
    
    const playerChoice = getChoice(text);
    if (!playerChoice) throw getMessage('suit_options', lang, { prefix: usedPrefix });
    
    var botChoice;
    const random = Math.random();
    
    if (random < 0.34) {
        botChoice = 'rock';
    } else if (random > 0.34 && random < 0.67) {
        botChoice = 'scissors';
    } else {
        botChoice = 'paper';
    }

    const playerDisplay = getDisplayName(playerChoice);
    const botDisplay = getDisplayName(botChoice);
    
    // Determine the winner
    if (playerChoice === botChoice) {
        m.reply(getMessage('suit_tie', lang, { player: playerDisplay, bot: botDisplay }));
    } else if (
        (playerChoice === 'rock' && botChoice === 'scissors') ||
        (playerChoice === 'scissors' && botChoice === 'paper') ||
        (playerChoice === 'paper' && botChoice === 'rock')
    ) {
        global.db.data.users[m.sender].money += 1000;
        m.reply(getMessage('suit_win', lang, { player: playerDisplay, bot: botDisplay }));
    } else {
        m.reply(getMessage('suit_lose', lang, { player: playerDisplay, bot: botDisplay }));
    }
}
handler.help = ['suit']
handler.tags = ['game']
handler.command = /^(suit)$/i

module.exports = handler

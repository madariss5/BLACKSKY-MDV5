const { getMessage } = require('../lib/languages');

// Handler function
let handler = async (m, { conn, command, args, usedPrefix }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    let user = global.db.data.users[m.sender];

    try {
        if (command === 'createakunyt') {
            if (args.length === 0) {
                return m.reply("Please enter your YouTube account name.\nExample: .createakunyt Mahiru");
            }

            // Combine all arguments into a single string (YouTube account name)
            let youtubeAccountName = args.join(' ');

            // Set the YouTube account name for the user
            user.youtube_account = youtubeAccountName;
            m.reply(`Your YouTube account has been successfully created/edited\nchannel: ${youtubeAccountName}`);
        } else if (command === 'deleteakun') {
            // Check if user has a YouTube account
            if (!user.youtube_account) {
                return m.reply("You don't have a YouTube account.");
            }

            // Delete user's YouTube account
            delete user.youtube_account;
            m.reply("Your YouTube account has been deleted from our system.");
        } else if (/live/i.test(command) && args[0] === 'youtuber') {
            // Check if user has a YouTube account
            if (!user.youtube_account) {
                return m.reply("Create an account first\nType: .createakunyt");
            }

            // Existing code for 'live youtuber' command
            // ...
        } else {
            return await m.reply("Command not recognized.\n*.akunyt*\n> To check your YouTube account\n*.live [live title]*\n> To start live streaming activity.");
        }
    } catch (err) {
        m.reply("Error\n\n\n" + err.stack);
    }
};

// Metadata
handler.help = ['createakunyt', 'deleteakun']; // Add 'deleteakun' to help commands
handler.tags = ['rpg'];
handler.command = /^(createakunyt|deleteakun)$/i; // Modify to include deleteakun command
handler.register = true;
handler.group = true;
handler.rpg = true;
}

module.exports = handler;
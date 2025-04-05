const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');


const sendDatabaseToGroup = async (conn, groupJid) => {
    try {
        const filePath = path.resolve('./database.json'); 
        if (!fs.existsSync(filePath)) {
            console.error('File database.json Not found!');
            return;
        }

        const fileBuffer = fs.readFileSync(filePath); 
        await conn.sendMessage(
            groupJid,
            {
                document: fileBuffer,
                mimetype: 'application/json',
                fileName: 'database.json',
            }
        );
        console.log(`Database successfully sent to group: ${groupJid}`);
    } catch (err) {
        console.error(getMessage('error', lang), err);
    }
};
const scheduleSendDatabase = (conn, groupJid) => {
    schedule.scheduleJob('00 22 * * *', async () => {   
        // 00 22 * * * means backup every day at 22:00
        // 00 -> minutes 22 -> hours
        console.log('Starting database backup at 22:00...');
        try {
            await sendDatabaseToGroup(conn, groupJid); 
        } catch (err) {
            console.error('An error occurred while sending:', err);
        }
    });
};

const groupJid = '120363216901617825@g.us'; // Replace with your group Jid! Can be obtained from (=> m)

if (global.conn) {
    scheduleSendDatabase(global.conn, groupJid);
} else {
    console.error('Connection to group not established yet!');
}

module.exports = {};
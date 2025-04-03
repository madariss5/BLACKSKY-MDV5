const { getMessage } = require('../lib/languages');

const fs = require("fs");
const { exec } = require("child_process");
const cp = require("child_process");
const { promisify } = require("util");
let exec_ = promisify(exec).bind(cp);

let handler = async (m, { conn, isROwner }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
   try {
      let zipFileName = `BackupScript.zip`;

      m.reply("Starting backup process. Please wait...");

      setTimeout(() => {
         let zipCommand = `zip -r ${zipFileName} * -x "node_modules/*"`;
         exec_(zipCommand, (err, stdout) => {
            if (err) {
               m.reply("An error occurred while creating the zip file.");
               console.error(err);
               return;
            }

            setTimeout(() => {
               if (fs.existsSync(zipFileName)) {
                  const file = fs.readFileSync(zipFileName);
                  conn.sendMessage(
                     m.chat,
                     {
                        document: file,
                        mimetype: "application/zip",
                        fileName: zipFileName,
                        caption: "Backup Completed. Please download the backup file.",
                     },
                     { quoted: m }
                  );

                  setTimeout(() => {
                     fs.unlinkSync(zipFileName);
                     m.reply("Backup file has been deleted.");
                  }, 5000);
               } else {
                  m.reply("Zip file not found.");
               }
            }, 60000); // Wait for 1 minute to ensure the zip file is created
         });
      }, 1000);
   } catch (error) {
      m.reply("An error occurred while performing the backup.");
      console.error(error);
   }
};

handler.help = ["backupsc"];
handler.tags = ["owner"];
handler.command = ["backupsc"];
handler.owner = true;

}

module.exports = handler;

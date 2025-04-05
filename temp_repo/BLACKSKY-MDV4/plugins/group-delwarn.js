const { getMessage } = require('../lib/languages.js');

let handler = async (m, { conn, args, groupMetadata}) => {
        // Get user language
        let user = global.db.data.users[m.sender];
        const lang = user?.language || global.language || 'en';
        const maxwarn = parseInt(global.maxwarn || 3); // Convert to number and default to 3 if not set
        
        let who;
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
        else who = m.chat;
        
        // Validation with translated messages
        if (!who) {
            return m.reply(lang === 'de' ? 
                '✳️ Bitte markiere einen Benutzer oder antworte auf eine Nachricht' : 
                '✳️ Please tag or mention someone');
        }
        
        if (!(who in global.db.data.users)) {
            return m.reply(lang === 'de' ? 
                '✳️ Benutzer ist nicht in meiner Datenbank' : 
                '✳️ User is not in my database');
        }
        
        let warn = global.db.data.users[who].warn || 0;
        
        if (warn > 0) {
            global.db.data.users[who].warn -= 1;
            
            // Create the message based on language
            let responseMsg = '';
            if (lang === 'de') {
                responseMsg = `⚠️ *WARNUNG ENTFERNT*
         
▢ Warnung: *-1*
▢ Verwarnungen insgesamt: *${warn - 1}*`;
            } else {
                responseMsg = `⚠️ *WARNING REMOVED*
         
▢ Warning: *-1*
▢ Total warnings: *${warn - 1}*`;
            }
            
            // Send to group - with enhanced reliability
            console.log(`[DELWARN] Sending confirmation to group chat: ${m.chat}`);
            try {
                await conn.sendMessage(m.chat, { 
                    text: responseMsg,
                    mentions: [who]
                });
                console.log(`[DELWARN] Successfully sent confirmation to group`);
            } catch (groupError) {
                console.error(`[DELWARN] Error sending to group:`, groupError);
                // Fallback to simple reply
                await m.reply(responseMsg);
                console.log(`[DELWARN] Used fallback m.reply for group message`);
            }
            
            // Message for the user
            let userMsg = '';
            if (lang === 'de') {
                userMsg = `✳️ Ein Admin hat eine Verwarnung entfernt, du hast jetzt *${warn - 1}* Verwarnungen`;
            } else {
                userMsg = `✳️ An admin reduced your warnings, you now have *${warn - 1}* warnings`;
            }
            
            // Send direct message to user - with enhanced reliability
            console.log(`[DELWARN] Sending notification to user: ${who}`);
            try {
                await conn.sendMessage(who, { text: userMsg });
                console.log(`[DELWARN] Successfully sent notification to user`);
            } catch (userError) {
                console.error(`[DELWARN] Error sending to user:`, userError);
                console.log(`[DELWARN] Handling error gracefully - user may not receive the notification`);
                
                // Also update database in case we need to track system messages
                if (global.db.data.groups[m.chat].warns && 
                    global.db.data.groups[m.chat].warns[who]) {
                    
                    // Update count in the warns system too
                    global.db.data.groups[m.chat].warns[who].count = warn - 1;
                }
            }
        } else if (warn <= 0) {
            m.reply(lang === 'de' ? 
                '✳️ Dieser Benutzer hat keine Verwarnungen' : 
                '✳️ This user has no warnings');
        }
}
handler.help = ['delwarn @user']
handler.tags = ['group']
handler.command = ['delwarn', 'unwarn'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler
const { getMessage } = require('../lib/languages.js');

let handler = async (m, { conn, text, args, groupMetadata, usedPrefix, command }) => {      
        // Get user language
        let user = global.db.data.users[m.sender];
        const lang = user?.language || global.language || 'en';
        const maxwarn = parseInt(global.maxwarn || 3); // Convert to number and default to 3 if not set
        
        let who;
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
        else who = m.chat;
        
        // Validation with translated messages
        if (!who) {
            return m.reply(`✳️ ${lang === 'de' ? 
                `Bitte markiere einen Benutzer oder antworte auf eine Nachricht.\n\n📌 Beispiel: ${usedPrefix + command} @user` : 
                `Please tag or mention someone.\n\n📌 Example: ${usedPrefix + command} @user`}`);
        }
        
        if (!(who in global.db.data.users)) {
            return m.reply(`✳️ ${lang === 'de' ? 
                'Benutzer ist nicht in meiner Datenbank.' : 
                'User is not in my database.'}`);
        }
        
        let name = conn.getName(m.sender);
        let warn = global.db.data.users[who].warn || 0;
        
        if (warn < maxwarn) {
            global.db.data.users[who].warn = (warn + 1);
            
            // Compose warning message based on language
            let warningMsg = '';
            if (lang === 'de') {
                warningMsg = `
⚠️ *Benutzer Verwarnt* ⚠️

▢ *Admin:* ${name}
▢ *Benutzer:* @${who.split`@`[0]}
▢ *Verwarnungen:* ${warn + 1}/${maxwarn}
▢ *Grund:* ${text || 'Nicht angegeben'}`;
            } else {
                warningMsg = `
⚠️ *User Warned* ⚠️

▢ *Admin:* ${name}
▢ *User:* @${who.split`@`[0]}
▢ *Warnings:* ${warn + 1}/${maxwarn}
▢ *Reason:* ${text || 'Not specified'}`;
            }
            
            // Send to group with mentions - improved for reliability
            console.log(`[WARN] Sending warning message to group chat: ${m.chat}`);
            try {
                await conn.sendMessage(m.chat, { 
                    text: warningMsg, 
                    mentions: [who]
                });
                console.log(`[WARN] Successfully sent group message`);
            } catch (groupError) {
                console.error(`[WARN] Error sending to group:`, groupError);
                // Fallback to simple reply
                await m.reply(warningMsg);
                console.log(`[WARN] Used fallback m.reply for group message`);
            }
            
            // Direct message to warned user
            let userMsg = '';
            if (lang === 'de') {
                userMsg = `
⚠️ *WARNUNG* ⚠️
Du hast eine Verwarnung von einem Admin erhalten.

▢ *Verwarnungen:* ${warn + 1}/${maxwarn}
Wenn du *${maxwarn}* Verwarnungen erhältst, wirst du automatisch aus der Gruppe entfernt.`;
            } else {
                userMsg = `
⚠️ *WARNING* ⚠️
You have received a warning from an admin.

▢ *Warnings:* ${warn + 1}/${maxwarn}
If you receive *${maxwarn}* warnings, you will be automatically removed from the group.`;
            }
            
            // Send to user directly - improved for reliability
            console.log(`[WARN] Sending direct message to warned user: ${who}`);
            try {
                await conn.sendMessage(who, { text: userMsg });
                console.log(`[WARN] Successfully sent direct message to user`);
            } catch (userError) {
                console.error(`[WARN] Error sending direct message to user:`, userError);
                // Store warning in reason
                if (!global.db.data.groups[m.chat].warns) global.db.data.groups[m.chat].warns = {};
                if (!global.db.data.groups[m.chat].warns[who]) global.db.data.groups[m.chat].warns[who] = { count: 0, reasons: [] };
                
                global.db.data.groups[m.chat].warns[who].count = warn + 1;
                global.db.data.groups[m.chat].warns[who].reasons = global.db.data.groups[m.chat].warns[who].reasons || [];
                global.db.data.groups[m.chat].warns[who].reasons.push({
                    reason: text || 'Not specified',
                    time: new Date().toISOString(),
                    admin: m.sender
                });
                
                console.log(`[WARN] Stored warning in database instead`);
            }
        } else if (warn >= maxwarn) {
            global.db.data.users[who].warn = 0;
            
            // Notify the group
            m.reply(lang === 'de' ? 
                `⛔ Benutzer hat das Warnungslimit von *${maxwarn}* überschritten und wird entfernt` : 
                `⛔ User exceeded the warning limit of *${maxwarn}* and will be removed`);
            
            // Add a small delay
            await time(3000);
            
            // Remove the user
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
            
            // Notify the removed user
            let kickMsg = '';
            if (lang === 'de') {
                kickMsg = `♻️ Du wurdest aus der Gruppe *${groupMetadata.subject}* entfernt, weil du *${maxwarn}* Verwarnungen erhalten hast`;
            } else {
                kickMsg = `♻️ You were removed from the group *${groupMetadata.subject}* because you received *${maxwarn}* warnings`;
            }
            
            m.reply(kickMsg, who);
        }
}
handler.help = ['warn @user']
handler.tags = ['group']
handler.command = ['warn'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler

const time = async (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
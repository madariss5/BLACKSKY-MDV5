/**
 * Global Blacklist System
 * Enhanced version with improved error handling and database initialization
 */

const handler = async (m, { conn, text, command }) => {
    // Initialize global blacklist if it doesn't exist
    if (!global.db.data.globalBlacklist) global.db.data.globalBlacklist = [];
    
    // Initialize users if it doesn't exist
    if (!global.db.data.users) global.db.data.users = {};
    
    // Parse who from mentions, quotes, or text
    let who = m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.quoted
        ? m.quoted.sender
        : text
        ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        : false;

    // Get the global blacklist from DB
    let globalBlacklist = global.db.data.globalBlacklist;

    try {
        // Check if this is a group chat
        if (m.isGroup) {
            const groupMetadata = await conn.groupMetadata(m.chat);
            const botAdmin = groupMetadata.participants.find(participant => 
                participant.id === conn.user.jid && ['admin', 'superadmin'].includes(participant.admin));
            
            if (!botAdmin) {
                return conn.reply(m.chat, 'Bot must be an admin to manage blacklist and perform kicks.', m);
            }
        }

        switch (command) {
            case 'blacklist':
                if (!who) return conn.reply(m.chat, 'Tag or reply to the person you want to blacklist.', m);

                // Check if already blacklisted
                if (globalBlacklist.includes(who)) {
                    return conn.reply(m.chat, `Number ${who.split(`@`)[0]} is already on the global blacklist.`, m);
                }

                // Add user to global blacklist and mark as banned
                globalBlacklist.push(who);
                global.db.data.globalBlacklist = globalBlacklist;
                
                // Also set the user as banned in the user database for consistency
                if (typeof global.db.data.users[who] !== 'object') {
                    global.db.data.users[who] = {};
                }
                global.db.data.users[who].banned = true;

                await conn.reply(m.chat, `Successfully added @${who.split(`@`)[0]} to the global blacklist.`, m, {
                    contextInfo: { mentionedJid: [who] }
                });

                // Fetch all groups where the bot is a member
                try {
                    const allGroups = await conn.groupFetchAllParticipating();
                    const groupIds = Object.keys(allGroups);

                    // Kick user from all groups where they and the bot are members
                    for (let groupId of groupIds) {
                        const groupInfo = allGroups[groupId];
                        const isMember = groupInfo.participants.some(member => member.id === who);
                        const botIsAdmin = groupInfo.participants.some(member => 
                            member.id === conn.user.jid && ['admin', 'superadmin'].includes(member.admin));

                        if (isMember && botIsAdmin) {
                            try {
                                await conn.groupParticipantsUpdate(groupId, [who], 'remove');
                                await conn.sendMessage(groupId, {
                                    text: `User @${who.split('@')[0]} has been globally blacklisted and removed from this group.`,
                                    mentions: [who]
                                });
                            } catch (error) {
                                console.error(`Failed to kick user from group ${groupId}:`, error.message || error);
                            }
                        }

                        // Add a 1 second delay between each kick request to avoid rate limits
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (e) {
                    console.error(getMessage('error', lang), e);
                    conn.reply(m.chat, `User was blacklisted but there was an error removing them from groups: ${e.message}`, m);
                }
                break;

            case 'unblacklist':
                if (!who) return conn.reply(m.chat, 'Tag or reply to the person you want to unblacklist.', m);

                const index = globalBlacklist.indexOf(who);
                if (index === -1) {
                    return conn.reply(m.chat, `Number ${who.split(`@`)[0]} is not on the global blacklist.`, m);
                }

                // Remove user from global blacklist and unban
                globalBlacklist.splice(index, 1);
                global.db.data.globalBlacklist = globalBlacklist;
                
                // Also unban the user in the user database for consistency
                if (typeof global.db.data.users[who] === 'object') {
                    global.db.data.users[who].banned = false;
                }

                await conn.reply(m.chat, `Successfully removed @${who.split(`@`)[0]} from the global blacklist.`, m, {
                    contextInfo: { mentionedJid: [who] }
                });
                break;

            case 'listblacklist':
            case 'listbl':
                if (globalBlacklist.length === 0) {
                    return conn.reply(m.chat, 'The global blacklist is currently empty.', m);
                }
                
                let txt = `*「 Global Blacklist Numbers 」*\n\n*Total:* ${globalBlacklist.length}\n\n┌─[ *Blacklist* ]\n`;
                for (let id of globalBlacklist) {
                    txt += `├ @${id.split("@")[0]}\n`;
                }
                txt += "└─•";

                return conn.reply(m.chat, txt, m, {
                    contextInfo: { mentionedJid: globalBlacklist }
                });
                break;
        }
    } catch (e) {
        console.error(getMessage('error', lang), e);
        conn.reply(m.chat, `An error occurred: ${e.message}`, m);
    }
};

// Autodeadcally kick blacklisted users when they send messages in any group
handler.before = function (m, { conn, isAdmin }) {
    if (!m.isGroup || m.fromMe) return;

    // Initialize if doesn't exist
    if (!global.db.data.globalBlacklist) global.db.data.globalBlacklist = [];
    let globalBlacklist = global.db.data.globalBlacklist;

    if (globalBlacklist.includes(m.sender) && !isAdmin) {
        try {
            conn.sendMessage(m.chat, {
                text: `User @${m.sender.split('@')[0]} is on the global blacklist and will be removed from this group.`,
                mentions: [m.sender]
            });
            conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        } catch (e) {
            console.error(getMessage('error', lang), e);
        }
    }
};

handler.help = ['blacklist', 'unblacklist', 'listblacklist'];
handler.tags = ['owner', 'group'];
handler.command = ['blacklist', 'unblacklist', 'listbl', 'listblacklist'];
handler.admin = handler.group = true;
handler.owner = true;

module.exports = handler;
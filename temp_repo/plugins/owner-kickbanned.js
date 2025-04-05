/**
 * Kick All Banned Users Command
 * 
 * This plugin allows owners to autodeadcally kick all banned or blacklisted users from a group.
 * It scans the group members and removes anyone who is either banned or on the global blacklist.
 */

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // Check if this is a group chat
    if (!m.isGroup) {
        return conn.reply(m.chat, 'This command can only be used in groups.', m);
    }
    
    // Check if bot is admin
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupMembers = groupMetadata.participants;
    
    const botAdmin = groupMembers.find(participant => 
        participant.id === conn.user.jid && 
        ['admin', 'superadmin'].includes(participant.admin)
    );
    
    if (!botAdmin) {
        return conn.reply(m.chat, 'The bot must be an admin to kick users.', m);
    }
    
    try {
        // Initialize database objects if they don't exist
        if (!global.db.data.users) global.db.data.users = {};
        if (!global.db.data.globalBlacklist) global.db.data.globalBlacklist = [];
        
        // Get banned and blacklisted users
        const bannedUsers = Object.entries(global.db.data.users)
            .filter(([id, data]) => data && data.banned)
            .map(([id]) => id);
            
        const blacklistedUsers = global.db.data.globalBlacklist || [];
        
        // Combine unique banned and blacklisted users
        const usersToKick = [...new Set([...bannedUsers, ...blacklistedUsers])]
            .filter(userId => userId !== conn.user.jid); // Don't kick the bot
        
        // Check which of these users are in the current group
        const membersToKick = groupMembers
            .filter(member => usersToKick.includes(member.id))
            .map(member => member.id);
        
        if (membersToKick.length === 0) {
            return conn.reply(m.chat, 'There are no banned or blacklisted users in this group.', m);
        }
        
        // Inform about the kick
        await conn.reply(
            m.chat, 
            `Found ${membersToKick.length} banned/blacklisted user(s) in this group.\nKicking them now...`, 
            m
        );
        
        // Kick each user with a delay to avoid rate limiting
        let kickedCount = 0;
        for (const userId of membersToKick) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [userId], 'remove');
                kickedCount++;
                
                // Send a notification for each kick
                await conn.sendMessage(m.chat, {
                    text: `Kicked ${kickedCount}/${membersToKick.length}: @${userId.split('@')[0]} (${global.db.data.globalBlacklist.includes(userId) ? 'Blacklisted' : 'Banned'})`,
                    mentions: [userId]
                });
                
                // Small delay between kicks
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error(`Failed to kick ${userId}:`, err);
            }
        }
        
        // Final report
        return conn.reply(
            m.chat, 
            `✅ Operation complete.\nSuccessfully kicked ${kickedCount}/${membersToKick.length} banned/blacklisted users from this group.`, 
            m
        );
    } catch (e) {
        console.error(getMessage('error', lang), e);
        return conn.reply(m.chat, `An error occurred while kicking banned users: ${e.message}`, m);
    }
};

handler.help = ['kickbanned', 'kickban'];
handler.tags = ['owner', 'group'];
handler.command = /^(kickbanned|kickban)$/i;
handler.owner = true;
handler.group = true;

module.exports = handler;
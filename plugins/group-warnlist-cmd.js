/**
 * Warning List Command
 * Simple standalone implementation for listing user warnings
 */

const { getMessage } = require('../lib/languages.js');

let handler = async (m, { conn, isAdmin }) => {
  console.log('=== WARNLIST COMMAND EXECUTED ===');
  console.log('Admin status:', isAdmin);
  console.log('Group ID:', m.chat);
  console.log('Sender ID:', m.sender);
  
  // More detailed debugging
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [WARNLIST-DEBUG] WARNLIST COMMAND STARTED`);
  try {
    const consoleOutput = `
      Command: .warnlist
      Sender: ${m.sender}
      Chat: ${m.chat}
      Chat type: ${m.isGroup ? 'group' : 'private'}
      isAdmin: ${isAdmin}
      Language: ${global.language}
    `;
    console.log('[WARNLIST-DEBUG] Command context:', consoleOutput);
  } catch (e) {
    console.error('[WARNLIST-DEBUG] Error in debug output:', e);
  }
  
  // Display waiting message first for better user experience
  try {
    await m.reply('⏳ Loading warnings...');
    console.log('[WARNLIST-DEBUG] Wait message sent successfully');
  } catch (err) {
    console.error('[WARNLIST-DEBUG] Error sending wait message:', err);
  }
  
  // Get user language
  let user;
  try {
    user = global.db.data.users[m.sender];
    console.log('[WARNLIST-DEBUG] User data:', user ? 'Found' : 'Not found');
  } catch (e) {
    console.error('[WARNLIST-DEBUG] Error accessing user data:', e);
    user = null;
  }
  
  const lang = user?.language || global.language || 'en';
  console.log('[WARNLIST-DEBUG] Language determined:', lang);
  
  // Get the warning limit (converted to number)
  const maxwarn = parseInt(global.maxwarn || 3);
  console.log('[WARNLIST-DEBUG] Max warn:', maxwarn);
  
  // Only work in groups
  if (!m.isGroup) {
    return m.reply(getMessage('group_only', lang));
  }
  
  // Check admin status manually if needed
  if (!isAdmin) {
    try {
      const groupMetadata = await conn.groupMetadata(m.chat);
      isAdmin = groupMetadata.participants.some(p => 
        p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      console.log('[WARNLIST] Checked admin status:', isAdmin);
    } catch (error) {
      console.error('[WARNLIST] Error checking admin status:', error);
      // Assume they're not an admin if we can't check
      isAdmin = false;
    }
  }
  
  if (!isAdmin) {
    return m.reply(getMessage('admin_only', lang));
  }
  
  try {
    // Check if database is properly initialized
    if (!global.db || !global.db.data) {
      console.error('[WARNLIST-CRITICAL] Database not initialized properly');
      return m.reply(getMessage('error_fetching_data', lang));
    }
    
    // Initialize database entries if needed
    if (!global.db.data.groups) {
      console.log('[WARNLIST-DEBUG] Initializing missing global.db.data.groups');
      global.db.data.groups = {};
    }
    
    if (!global.db.data.groups[m.chat]) {
      console.log('[WARNLIST-DEBUG] Initializing missing group data for', m.chat);
      global.db.data.groups[m.chat] = {};
    }
    
    if (!global.db.data.groups[m.chat].warns) {
      console.log('[WARNLIST-DEBUG] Initializing missing warns for group', m.chat);
      global.db.data.groups[m.chat].warns = {};
    }
    
    const groupWarns = global.db.data.groups[m.chat].warns || {};
    console.log('[WARNLIST-DEBUG] Group warns type:', typeof groupWarns);
    console.log('[WARNLIST-DEBUG] Group warns keys:', Object.keys(groupWarns).length);
    
    const warnLimit = global.db.data.groups[m.chat].warnLimit || maxwarn;
    
    // Format date based on user language
    // Make formatDate function available in a wider scope
    global.tempFormatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error('[WARNLIST] Date formatting error:', e);
        return dateString || 'unknown date';
      }
    };
    
    const formatDate = global.tempFormatDate;
    
    // Collect users with warnings from both systems
    const warnedUsers = new Set();
    
    console.log('[WARNLIST] Group warns structure:', JSON.stringify(groupWarns || {}).substring(0, 200));
    
    try {
      // Add from new system
      if (groupWarns && typeof groupWarns === 'object') {
        Object.keys(groupWarns).forEach(userId => {
          if (groupWarns[userId] && groupWarns[userId].count > 0) {
            console.log(`[WARNLIST] User ${userId} has ${groupWarns[userId].count} warnings`);
            warnedUsers.add(userId);
          }
        });
      } else {
        console.log('[WARNLIST] groupWarns is not properly initialized');
      }
      
      // Add from old system
      if (global.db.data.users && typeof global.db.data.users === 'object') {
        Object.keys(global.db.data.users).forEach(userId => {
          if (global.db.data.users[userId] && global.db.data.users[userId].warn > 0) {
            console.log(`[WARNLIST] User ${userId} has ${global.db.data.users[userId].warn} old warnings`);
            warnedUsers.add(userId);
          }
        });
      } else {
        console.log('[WARNLIST] global.db.data.users is not properly initialized');
      }
      
      console.log(`[WARNLIST] Found ${warnedUsers.size} users with warnings`);
    } catch (e) {
      console.error('[WARNLIST] Error collecting warned users:', e);
    }
    
    // If no warnings found
    if (warnedUsers.size === 0) {
      console.log('[WARNLIST-DEBUG] No warned users found, sending empty message');
      return m.reply(getMessage('warnlist_empty', lang));
    }
    
    console.log('[WARNLIST-DEBUG] Creating warning message:');
    
    // Immediate approach - Build and send the message directly within this scope
    try {
      // Create warning list message here first
      let warningMessage = `*${getMessage('warnlist_title', lang) || 'Warning List'}*\n`;
      warningMessage += `${getMessage('limit_reached', lang) || 'Warning limit'}: ${warnLimit}\n\n`;
      
      const directMentions = [];
      
      Array.from(warnedUsers).forEach(userId => {
        // Add user to mentions
        directMentions.push(userId);
        
        // Get warning count
        const newCount = groupWarns[userId]?.count || 0;
        const oldCount = global.db.data.users[userId]?.warn || 0;
        const warnCount = Math.max(newCount, oldCount);
        
        // Add user entry
        warningMessage += getMessage('warnlist_entry', lang)
          .replace('%user%', `@${userId.split('@')[0]}`)
          .replace('%count%', warnCount) + '\n';
          
        // Add reasons if available
        if (groupWarns[userId] && groupWarns[userId].reasons) {
          groupWarns[userId].reasons.forEach((reasonData, index) => {
            let reasonMessage = getMessage('warnlist_reason', lang);
            if (reasonMessage) {
              try {
                const date = new Date(reasonData.time);
                const formattedDate = date.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US');
                
                reasonMessage = reasonMessage
                  .replace('%reason%', reasonData.reason || 'No reason')
                  .replace('%date%', formattedDate);
                
                warningMessage += `  ${index + 1}. ${reasonMessage}\n`;
              } catch (e) {
                console.error('[WARNLIST-DEBUG] Date formatting error:', e);
                warningMessage += `  ${index + 1}. ${reasonData.reason || 'No reason'}\n`;
              }
            }
          });
        }
        
        warningMessage += '\n';
      });
      
      console.log('[WARNLIST-DEBUG] Created warning message, attempting to send...');
      
      // Send the message directly
      await m.reply(warningMessage);
      console.log('[WARNLIST-DEBUG] Warning message sent via direct method');
      
      // Return early to prevent double-processing
      return true;
    } catch (err) {
      console.error('[WARNLIST-DEBUG] Error in direct message sending:', err);
      // Continue with original code as fallback
    }
    
    // Store these variables in the outer scope so they're accessible in the message creation part (fallback)
    const warnedUsersArray = Array.from(warnedUsers);
    const outerGroupWarns = groupWarns;
  } catch (error) {
    console.error('[WARNLIST] Critical error in initialization:', error);
    // Use the appropriate translation key for the error message
    return m.reply(getMessage('error_fetching_data', lang) || 'Error accessing warning data');
  }
  
  // Create warning list message
  let message = `*${getMessage('warnlist_title', lang)}*\n`;
  
  // Format limit message correctly
  const limitMessage = getMessage('limit_reached', lang) || 'Warning limit';
  const warnLimit = (global.db && global.db.data && global.db.data.groups && global.db.data.groups[m.chat] && 
                    global.db.data.groups[m.chat].warnLimit) || (global.maxwarn || 3);
  message += `${limitMessage}: ${warnLimit}\n\n`;
  
  const mentions = [];
  
  // Use the variable we stored earlier to avoid scope issues
  warnedUsersArray.forEach(userId => {
    mentions.push(userId);
    
    // Get warning count from both systems
    const newCount = outerGroupWarns[userId]?.count || 0;
    const oldCount = global.db.data.users[userId]?.warn || 0;
    const warnCount = Math.max(newCount, oldCount);
    
    // Fixed getMessage calls to properly replace placeholders
    const entryMessage = getMessage('warnlist_entry', lang)
      .replace('%user%', `@${userId.split('@')[0]}`)
      .replace('%count%', warnCount);
    
    message += entryMessage + '\n';
    
    // Add warning reasons if available
    if (outerGroupWarns[userId] && outerGroupWarns[userId].reasons) {
      outerGroupWarns[userId].reasons.forEach((reasonData, index) => {
        // Fixed getMessage calls with proper placeholder replacement
        let reasonMessage = getMessage('warnlist_reason', lang);
        if (reasonMessage) {
          try {
            // Define formatDate locally if it's not in scope
            let dateStr = reasonData.time || 'unknown date';
            try {
              const date = new Date(reasonData.time);
              dateStr = date.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch (e) {
              console.error('[WARNLIST] Date formatting error in fallback:', e);
            }
            
            reasonMessage = reasonMessage
              .replace('%reason%', reasonData.reason || 'No reason')
              .replace('%date%', dateStr);
            
            message += `  ${index + 1}. ${reasonMessage}\n`;
          } catch (e) {
            console.error('[WARNLIST-DEBUG] Error in reason formatting:', e);
            message += `  ${index + 1}. ${reasonData.reason || 'No reason'}\n`;
          }
        }
      });
    }
    
    message += '\n';
  });
  
  // Add more verbose logging
  console.log(`[WARNLIST] Sending message with ${mentions.length} mentions`);
  console.log(`[WARNLIST] Message content: ${message.substring(0, 100)}...`);
  
  try {
    console.log(`[WARNLIST] Preparing to send message with ${mentions.length} mentions`);
    console.log(`[WARNLIST] Message preview: ${message.substring(0, 100)}...`);
    
    // Make sure we have valid mentions
    if (!mentions.length) {
      console.log('[WARNLIST] No valid mentions found, sending simple message');
      return m.reply(message); // Simple message without mentions
    }
    
    // Try direct simple reply first - this often works even when mentions don't
    try {
      await m.reply(message);
      console.log('[WARNLIST] Sent basic message via m.reply');
    } catch (replyError) {
      console.log('[WARNLIST] Basic reply failed:', replyError.message);
    }
    
    // Try with properly formatted mentions
    try {
      const formattedMentions = mentions.map(m => 
        m.includes('@s.whatsapp.net') ? m : `${m}@s.whatsapp.net`
      );
      console.log(`[WARNLIST] Attempting with ${formattedMentions.length} formatted mentions`);
      
      // Use conn.sendMessage with explicit configuration for better reliability
      await conn.sendMessage(m.chat, { 
        text: message,
        mentions: formattedMentions,
        quoted: m
      });
      
      console.log('[WARNLIST] Message with mentions sent successfully');
    } catch (mentionsError) {
      console.error('[WARNLIST] Error sending with mentions:', mentionsError);
      
      // If we've already sent a basic reply, don't try again
      // Just log the error
      console.log('[WARNLIST] Continuing since basic message was already sent');
    }
    
    return true; // Indicate we've handled the command
  } catch (error) {
    console.error('[WARNLIST] All sending methods failed:', error);
    
    // Last resort - try a very simplified message with just user ids and counts
    try {
      console.log('[WARNLIST-DEBUG] Attempting ultra-simplified fallback');
      
      let ultraSimpleMsg = `*${getMessage('warnlist_title', lang) || 'Warning List'}*\n\n`;
      
      // Just output user IDs and counts without any fancy formatting
      if (warnedUsersArray && warnedUsersArray.length) {
        warnedUsersArray.forEach(userId => {
          try {
            const newCount = (outerGroupWarns && outerGroupWarns[userId] && outerGroupWarns[userId].count) || 0;
            const oldCount = (global.db && global.db.data && global.db.data.users && 
                             global.db.data.users[userId] && global.db.data.users[userId].warn) || 0;
            const warnCount = Math.max(newCount, oldCount);
            
            const userNumber = userId.split('@')[0];
            ultraSimpleMsg += `User: +${userNumber} - Warnings: ${warnCount}\n`;
          } catch (e) {
            console.error('[WARNLIST-DEBUG] Error in ultra-simple formatting for user', userId, e);
          }
        });
      } else {
        ultraSimpleMsg += getMessage('warnlist_error_fallback', lang) || 'Error showing warned users. Please try again later.';
      }
      
      return m.reply(ultraSimpleMsg);
    } catch (finalError) {
      console.error('[WARNLIST] Even ultra-simplified fallback failed:', finalError);
      
      // Absolute last resort - just a text message
      try {
        return m.reply(getMessage('error_fetching_data', lang) || 'Error processing warning list. Please contact the bot administrator.');
      } catch (e) {
        console.error('[WARNLIST] Complete failure:', e);
      }
    }
  }
};

handler.help = ['warnlist'];
handler.tags = ['group', 'admin'];
handler.command = /^(warnlist|listwarn)$/i;
handler.group = true;
handler.admin = true;

module.exports = handler;
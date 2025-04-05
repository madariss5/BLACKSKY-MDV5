const { getMessage } = require('../lib/languages');
const PhoneNumber = require('awesome-phonenumber');
const levelling = require('../lib/levelling');
const { createHash } = require('crypto');
const fetch = require('node-fetch');
const moment = require('moment-timezone');

/**
 * Function to format time duration into a human-readable string
 * @param {number} ms - Time in milliseconds
 * @return {string} Formatted time string
 */
function msToDate(ms) {
  let days = Math.floor(ms / (24 * 60 * 60 * 1000));
  let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${days} Days ${hours} Hours ${minutes} Minutes`;
}

/**
 * Handler for the profile command
 */
let handler = async (m, { conn, text, usedPrefix }) => {
  console.log('[PROFILE] Profile command triggered by', m.sender);
  
  // Get user's preferred language
  const userData = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = userData?.language || chat?.language || global.language;
  
  // Parse and sanitize input
  let sanitizedText = text ? text.replace(/\s/g, '').replace(/[@+-]/g, '') : '';
  let number = sanitizedText ? (sanitizedText.startsWith('@') ? sanitizedText.slice(1) : sanitizedText) : '';
  number = isNaN(number) ? (sanitizedText.split('@')[0] || '') : number;
  
  console.log('[PROFILE] Processed input:', { sanitizedText, number });
  
  // Handle no input case
  if (!sanitizedText && !m.quoted) {
    console.log('[PROFILE] No input provided, showing help text');
    return conn.reply(m.chat, `*❏ GET PROFILE*

• Tag user: *${usedPrefix}profile @Tag*
• Enter number: *${usedPrefix}profile 6289654360447*
• Check your profile: *(Reply to your own message)*`, m);
  }
  
  // Handle invalid number format
  if (number && (isNaN(number) || number.length > 15) && !m.quoted) {
    console.log('[PROFILE] Invalid number format:', number);
    return conn.reply(m.chat, `*❏ INVALID NUMBER*

• Tag user: *${usedPrefix}profile @Tag*
• Enter number: *${usedPrefix}profile 6289654360447*`, m);
  }
  
  // Determine whose profile to show
  let who;
  if (m.quoted) {
    who = m.quoted.sender;
    console.log('[PROFILE] Using quoted message sender:', who);
  } else if (number) {
    who = number + '@s.whatsapp.net';
    console.log('[PROFILE] Using provided number:', who);
  } else {
    who = m.sender;
    console.log('[PROFILE] Using message sender:', who);
  }
  
  // Get profile picture
  let pp = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXIdvC1Q4WL7_zA6cJm3yileyBT2OsWhBb9Q&usqp=CAU';
  try {
    console.log('[PROFILE] Attempting to fetch profile picture for', who);
    pp = await conn.profilePictureUrl(who, 'image');
    console.log('[PROFILE] Successfully fetched profile picture');
  } catch (e) {
    console.log('[PROFILE] Error getting profile picture:', e.message);
  }
  
  // Ensure user data exists
  if (typeof global.db.data.users[who] !== 'object') {
    console.log('[PROFILE] Initializing user data for', who);
    global.db.data.users[who] = {};
  }
  
  // Get user data
  const targetUser = global.db.data.users[who];
  const now = Date.now();
  
  // Set default values if missing
  targetUser.premiumTime = targetUser.premiumTime || 0;
  targetUser.name = targetUser.name || '';
  targetUser.pasangan = targetUser.pasangan || '';
  targetUser.limit = targetUser.limit || 0;
  targetUser.exp = targetUser.exp || 0;
  targetUser.money = targetUser.money || 0;
  targetUser.bank = targetUser.bank || 0;
  targetUser.age = targetUser.age || 0;
  targetUser.level = targetUser.level || 0;
  targetUser.role = targetUser.role || '';
  targetUser.registered = targetUser.registered || false;
  
  // Fix registration time issues
  if (targetUser.registered && (!targetUser.regTime || targetUser.regTime === 0)) {
    console.log('[PROFILE] Fixing missing registration time');
    // If registered but no regTime, set to a recent time
    targetUser.regTime = now - (24 * 60 * 60 * 1000); // 1 day ago
  } else if (!targetUser.registered && targetUser.regTime) {
    console.log('[PROFILE] Fixing inconsistent registration status');
    // If regTime exists but not registered, fix the status
    targetUser.registered = true;
  }
  
  targetUser.premium = targetUser.premium || false;
  targetUser.banned = targetUser.banned || false;
  
  // Calculate premium time left
  let premiumTimeLeft;
  if (targetUser.premiumTime > now) {
    // For active premium users, show days/hours/minutes left
    premiumTimeLeft = msToDate(targetUser.premiumTime - now);
    
    // Also add the exact expiry date in European format using global timezone
    const expiryDate = moment(targetUser.premiumTime).tz(global.timezone || 'Europe/Berlin').format('DD.MM.YYYY HH:mm');
    premiumTimeLeft += ` (until ${expiryDate})`;
  } else {
    // For non-premium users
    premiumTimeLeft = '*Premium expiry not set!*';
  }
  
  // Destructure user data for easier access
  const { 
    name, pasangan, limit, exp, money, bank, age, 
    level, role, registered, regTime, premium, banned 
  } = targetUser;
  
  // Always calculate correct level from XP to ensure it's up-to-date
  try {
    console.log('[PROFILE] Calculating correct level for user with XP:', exp);
    const calculatedLevel = levelling.findLevel(exp, global.multiplier);
    
    // Only update if there's a mismatch or level is 0
    if (level !== calculatedLevel || level === 0) {
      console.log('[PROFILE] Updating level from', level, 'to', calculatedLevel);
      
      // Update user's level in database
      targetUser.level = calculatedLevel;
      
      // Also update role if necessary
      const roles = [
        'Newbie ㋡', 'Beginner Grade 1 ⚊¹', 'Beginner Grade 2 ⚊²', 'Beginner Grade 3 ⚊³',
        'Beginner Grade 4 ⚊⁴', 'Private Grade 1 ⚌¹', 'Private Grade 2 ⚌²'
      ];
      
      if (calculatedLevel > 0 && (!targetUser.role || targetUser.role === 'Newbie ㋡')) {
        const roleIndex = Math.min(calculatedLevel, roles.length - 1);
        targetUser.role = roles[roleIndex];
        console.log('[PROFILE] Updated role to:', targetUser.role);
      }
      
      // Enable auto-levelup
      targetUser.autolevelup = true;
    }
  } catch (e) {
    console.error('[PROFILE] Error calculating level from XP:', e);
  }
  
  // Calculate XP and level data using the current level in the database
  let levelData = { min: 0, xp: 0, max: 0 };
  try {
    // Use the current level in the database after potential update
    console.log('[PROFILE] Calculating XP range for level', targetUser.level);
    levelData = levelling.xpRange(targetUser.level, global.multiplier);
  } catch (e) {
    console.error('[PROFILE] Error calculating XP range:', e);
  }
  const { min, xp, max } = levelData;
  const xpToLevelUp = Math.max(0, max - exp);
  
  // Get user infordeadon
  let username = '';
  try {
    console.log('[PROFILE] Getting display name for', who);
    username = conn.getName(who);
  } catch (e) {
    console.log('[PROFILE] Error getting name, using JID:', e.message);
    username = who.split('@')[0];
  }
  
  // Get about/status
  let about = '';
  try {
    console.log('[PROFILE] Fetching user status');
    about = (await conn.fetchstatus(who).catch(() => ({}))).status || '';
  } catch (e) {
    console.log('[PROFILE] Error fetching status:', e.message);
  }
  
  // Create serial number
  const sn = createHash('md5').update(who).digest('hex');
  
  // Get relationship status
  let relationshipstatus = 'Single';
  if (pasangan) {
    try {
      console.log('[PROFILE] Formatting relationship status');
      relationshipstatus = `In relationship with @${partner.split('@')[0]}`;
    } catch (e) {
      console.log('[PROFILE] Error formatting relationship:', e.message);
    }
  }
  
  // Format phone number
  let phoneNumber = '';
  try {
    const rawNumber = who.replace('@s.whatsapp.net', '');
    console.log('[PROFILE] Formatting phone number:', rawNumber);
    phoneNumber = PhoneNumber('+' + rawNumber).getNumber('international');
  } catch (e) {
    console.log('[PROFILE] Error formatting phone number:', e.message);
    phoneNumber = '+' + who.replace('@s.whatsapp.net', '');
  }
  
  // Check blacklist status
  let isBlacklisted = false;
  if (global.db.data.globalBlacklist && Array.isArray(global.db.data.globalBlacklist)) {
    isBlacklisted = global.db.data.globalBlacklist.includes(who);
  }
  
  // Format ban status text
  const banstatusText = banned 
    ? '❌ Banned from using bot' 
    : (isBlacklisted 
      ? '⛔ GLOBALLY BLACKLISTED (auto-removed from groups)' 
      : '✅ Not banned');
      
  // Fix negative age display
  const displayAge = (registered && age > 0) ? age : (registered ? 'Not set' : '');
  
  // Build profile text with translations
  const profileTitle = getMessage('profile_title', lang);
  const profileRpgTitle = getMessage('profile_rpg_title', lang);
  const profileStatusTitle = getMessage('profile_status_title', lang);
  
  // Determine yes/no translations based on language
  const yes = lang === 'de' ? 'Ja' : 'Yes';
  const no = lang === 'de' ? 'Nein' : 'No';
  const dateUnknown = lang === 'de' ? 'Datum unbekannt' : 'Date unknown';
  const readyToLevelUp = lang === 'de' ? `✨ Bereit zum *${usedPrefix}levelup*` : `✨ Ready to *${usedPrefix}levelup*`;
  const xpNeeded = lang === 'de' ? `⏳ ${xpToLevelUp} XP benötigt für das nächste Level` : `⏳ ${xpToLevelUp} XP needed for next level`;
  
  const profileText = `
┌─⊷ *${profileTitle}*
👤 • Username: ${username} ${registered ? `(${name})` : ''} (@${who.split('@')[0]})
👥 • About: ${about}
🏷 • status: ${relationshipstatus}
📞 • Number: ${phoneNumber}
🔢 • Serial Number: ${sn}
🔗 • Link: https://wa.me/${who.split('@')[0]}
👥 • Age: ${displayAge}
└──────────────

┌─⊷ *${profileRpgTitle}*
▢ level: ${targetUser.level}
▢ XP: ${exp} / ${max}
▢ Progress: [${Math.max(0, exp - min)} / ${xp}]
▢ ${xpToLevelUp <= 0 ? readyToLevelUp : xpNeeded}
▢ Role: ${targetUser.role}
▢ Limit: ${limit}
▢ Money: ${money}
└──────────────

┌─⊷ *${profileStatusTitle}*
📑 • Registered: ${registered ? 
    (regTime ? `${yes} (${moment(regTime).tz(global.timezone || 'Europe/Berlin').format('DD.MM.YYYY HH:mm')})` : `${yes} (${dateUnknown})`) 
    : no}
🌟 • Premium: ${premium ? yes : no}
⏰ • Premium Time: ${premiumTimeLeft}
🚫 • Ban status: ${banstatusText}
└──────────────`.trim();
  
  console.log('[PROFILE] Profile text generated, preparing to send');
  
  // Extract mentions and send profile
  try {
    const mentions = conn.parseMention(profileText);
    console.log('[PROFILE] Extracted mentions:', mentions.length);
    
    await conn.sendFile(m.chat, pp, 'profile.jpg', profileText, m, false, {
      contextInfo: { mentionedJid: mentions }
    });
    console.log('[PROFILE] Successfully sent profile with image and mentions');
  } catch (e) {
    console.error('[PROFILE] Error sending profile with mentions:', e);
    try {
      // Fallback without mentions
      await conn.sendFile(m.chat, pp, 'profile.jpg', profileText, m);
      console.log('[PROFILE] Sent profile fallback without mentions');
    } catch (fallbackError) {
      console.error('[PROFILE] Complete failure sending profile:', fallbackError);
      await conn.reply(m.chat, 'Error fetching profile. Please try again later.', m);
    }
  }
};

handler.help = ['profile [@user]'];
handler.tags = ['info'];
handler.command = /^(profile|profil)$/i;
handler.limit = false;
handler.register = false;
handler.group = false;

module.exports = handler;

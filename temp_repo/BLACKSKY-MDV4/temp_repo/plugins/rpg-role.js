const { getMessage } = require('../lib/languages');

/**
 * Role assignment based on user level
 * Autodeadcally assigns appropriate role based on user's level
 */
let handler = async (m, { conn }) => {
    // Get user's preferred language
    const userData = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = userData?.language || chat?.language || global.language;
    
    // Previous role for comparison
    const previousRole = userData.role || '';
    
    // Assign role based on level thresholds
    let role = (userData.level <= 2) ? 'Newbie ㋡'
          : ((userData.level >= 2) && (userData.level <= 4)) ? 'Beginner Grade 1 ⚊¹'
          : ((userData.level >= 4) && (userData.level <= 6)) ? 'Beginner Grade 2 ⚊²'
          : ((userData.level >= 6) && (userData.level <= 8)) ? 'Beginner Grade 3 ⚊³'
          : ((userData.level >= 8) && (userData.level <= 10)) ? 'Beginner Grade 4 ⚊⁴'
          : ((userData.level >= 10) && (userData.level <= 20)) ? 'Private Grade 1 ⚌¹'
          : ((userData.level >= 20) && (userData.level <= 30)) ? 'Private Grade 2 ⚌²'
          : ((userData.level >= 30) && (userData.level <= 40)) ? 'Private Grade 3 ⚌³'
          : ((userData.level >= 40) && (userData.level <= 50)) ? 'Private Grade 4 ⚌⁴'
          : ((userData.level >= 50) && (userData.level <= 60)) ? 'Private Grade 5 ⚌⁵'
          : ((userData.level >= 60) && (userData.level <= 70)) ? 'Corporal Grade 1 ☰¹' 
          : ((userData.level >= 70) && (userData.level <= 80)) ? 'Corporal Grade 2 ☰²' 
          : ((userData.level >= 80) && (userData.level <= 90)) ? 'Corporal Grade 3 ☰³' 
          : ((userData.level >= 90) && (userData.level <= 100)) ? 'Corporal Grade 4 ☰⁴' 
          : ((userData.level >= 100) && (userData.level <= 110)) ? 'Corporal Grade 5 ☰⁵'
          : ((userData.level >= 110) && (userData.level <= 120)) ? 'Sergeant Grade 1 ≣¹'
          : ((userData.level >= 120) && (userData.level <= 130)) ? 'Sergeant Grade 2 ≣²'
          : ((userData.level >= 130) && (userData.level <= 140)) ? 'Sergeant Grade 3 ≣³'
          : ((userData.level >= 140) && (userData.level <= 150)) ? 'Sergeant Grade 4 ≣⁴'
          : ((userData.level >= 150) && (userData.level <= 160)) ? 'Sergeant Grade 5 ≣⁵' 
          : ((userData.level >= 160) && (userData.level <= 170)) ? 'Staff Sgt. Grade 1 ﹀¹' 
          : ((userData.level >= 170) && (userData.level <= 180)) ? 'Staff Sgt. Grade 2 ﹀²' 
          : ((userData.level >= 180) && (userData.level <= 190)) ? 'Staff Sgt. Grade 3 ﹀³' 
          : ((userData.level >= 190) && (userData.level <= 200)) ? 'Staff Sgt. Grade 4 ﹀⁴' 
          : ((userData.level >= 200) && (userData.level <= 210)) ? 'Staff Sgt. Grade 5 ﹀⁵' 
          : ((userData.level >= 210) && (userData.level <= 220)) ? 'Master Sgt. Grade 1 ︴¹'
          : ((userData.level >= 220) && (userData.level <= 230)) ? 'Master Sgt. Grade 2 ︴²'
          : ((userData.level >= 230) && (userData.level <= 240)) ? 'Master Sgt. Grade 3 ︴³'
          : ((userData.level >= 240) && (userData.level <= 250)) ? 'Master Sgt. Grade 4 ︴⁴'
          : ((userData.level >= 250) && (userData.level <= 260)) ? 'Master Sgt. Grade 5 ︴⁵'
          : ((userData.level >= 260) && (userData.level <= 270)) ? '2nd Lt. Grade 1 ♢¹'
          : ((userData.level >= 270) && (userData.level <= 280)) ? '2nd Lt. Grade 2 ♢²'  
          : ((userData.level >= 280) && (userData.level <= 290)) ? '2nd Lt. Grade 3 ♢³' 
          : ((userData.level >= 290) && (userData.level <= 300)) ? '2nd Lt. Grade 4 ♢⁴' 
          : ((userData.level >= 300) && (userData.level <= 310)) ? '2nd Lt. Grade 5 ♢⁵'
          : ((userData.level >= 310) && (userData.level <= 320)) ? '1st Lt. Grade 1 ♢♢¹'
          : ((userData.level >= 320) && (userData.level <= 330)) ? '1st Lt. Grade 2 ♢♢²'
          : ((userData.level >= 330) && (userData.level <= 340)) ? '1st Lt. Grade 3 ♢♢³'
          : ((userData.level >= 340) && (userData.level <= 350)) ? '1st Lt. Grade 4 ♢♢⁴'
          : ((userData.level >= 350) && (userData.level <= 360)) ? '1st Lt. Grade 5 ♢♢⁵'
          : ((userData.level >= 360) && (userData.level <= 370)) ? 'Major Grade 1 ✷¹'
          : ((userData.level >= 370) && (userData.level <= 380)) ? 'Major Grade 2 ✷²'
          : ((userData.level >= 380) && (userData.level <= 390)) ? 'Major Grade 3 ✷³'
          : ((userData.level >= 390) && (userData.level <= 400)) ? 'Major Grade 4 ✷⁴'
          : ((userData.level >= 400) && (userData.level <= 410)) ? 'Major Grade 5 ✷⁵'
          : ((userData.level >= 410) && (userData.level <= 420)) ? 'Colonel Grade 1 ✷✷¹'
          : ((userData.level >= 420) && (userData.level <= 430)) ? 'Colonel Grade 2 ✷✷²'
          : ((userData.level >= 430) && (userData.level <= 440)) ? 'Colonel Grade 3 ✷✷³'
          : ((userData.level >= 440) && (userData.level <= 450)) ? 'Colonel Grade 4 ✷✷⁴'
          : ((userData.level >= 450) && (userData.level <= 460)) ? 'Colonel Grade 5 ✷✷⁵'
          : ((userData.level >= 460) && (userData.level <= 480)) ? 'Brigadier General Grade 1 ✰'
          : ((userData.level >= 480) && (userData.level <= 500)) ? 'Brigadier General Grade 2 ✰²'
          : ((userData.level >= 500) && (userData.level <= 550)) ? 'Brigadier General Grade 3 ✰³'
          : ((userData.level >= 550) && (userData.level <= 600)) ? 'Major General ✰✰'
          : ((userData.level >= 600) && (userData.level <= 700)) ? 'Lieutenant General ✰✰✰'
          : ((userData.level >= 700) && (userData.level <= 800)) ? 'General ✰✰✰✰'
          : ((userData.level >= 800) && (userData.level <= 900)) ? 'Commander ★'
          : ((userData.level >= 900) && (userData.level <= 1000)) ? 'Supreme Leader ★★★★★'
          : 'Legendary Master ✯✯✯✯✯✯';
    
    // Update user's role
    userData.role = role;
    
    // Check if role changed
    const hasRoleChanged = previousRole !== role;
    
    // Prepare response message
    let message;
    
    if (hasRoleChanged && previousRole) {
      // Role promotion message
      message = `🎖️ *ROLE PROMOTION* 🎖️\n\nYou've been promoted from:\n*${previousRole}* ➜ *${role}*\n\nCongratulations on your advancement!`;
    } else {
      // Regular role display
      message = getMessage('your_role', lang, { role: userData.role  || {}}) || `Your current role is: *${userData.role}*`;
      message += `\n\nLevel: *${userData.level}*`;
      message += `\nUse *.levelup* command to level up when you have enough XP.`;
      message += `\nUse *.roles* to see all available roles.`;
    }
    
    // Send the message
    await conn.reply(m.chat, message, m);
}

handler.help = ['role']
handler.tags = ['info']
handler.command = /^(role|levelrole)$/i
handler.register = true
handler.rpg = true
module.exports = handler
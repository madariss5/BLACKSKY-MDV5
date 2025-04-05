const { getMessage } = require('../lib/languages.js');
const fs = require('fs');
const path = require('path');

/**
 * GIF Reactions Menu
 * 
 * This plugin displays a menu of all available reaction GIFs
 * organized by categories to make them easier to find.
 * It dynamically generates the list based on the GIFs in the gifs folder.
 */

const handler = async (m, { conn, usedPrefix }) => {
  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language;
  
  // Get all available GIFs
  let availableGifs = [];
  try {
    const gifsDir = path.join(process.cwd(), 'gifs');
    if (fs.existsSync(gifsDir)) {
      availableGifs = fs.readdirSync(gifsDir)
        .filter(file => file.toLowerCase().endsWith('.gif'))
        .map(file => file.replace('.gif', ''));
    }
  } catch (err) {
    console.error('[GIFMENU] Error reading gifs directory:', err);
  }
  
  // Define categories
  const positiveEmotions = [
    'happy', 'smile', 'laugh', 'excited', 'dance', 
    'cool', 'proud', 'wink', 'blush'
  ].filter(gif => availableGifs.includes(gif));
  
  const affectionInteraction = [
    'hug', 'kiss', 'pat', 'cuddle', 'poke', 'highfive',
    'wave', 'love'
  ].filter(gif => availableGifs.includes(gif));
  
  const negativeEmotions = [
    'angry', 'sad', 'bored', 'tired', 'confused', 
    'shy', 'facepalm', 'scared', 'shock', 'disgusted', 
    'nervous', 'panic', 'jealous', 'sleepy', 'surprised'
  ].filter(gif => availableGifs.includes(gif));
  
  const playfulActions = [
    'bite', 'bonk', 'punch', 'slap', 'kill', 'yeet',
    'greedy', 'hungry', 'fuck', 'horny'
  ].filter(gif => availableGifs.includes(gif));
  
  // Find any GIFs not categorized
  const otherGifs = availableGifs.filter(gif => 
    !positiveEmotions.includes(gif) && 
    !affectionInteraction.includes(gif) && 
    !negativeEmotions.includes(gif) && 
    !playfulActions.includes(gif) &&
    !gif.includes('images') // Skip any image files that might have been included
  );
  
  // Format commands with prefix and group them by 3-4 per line
  const formatCommands = (commands) => {
    let result = '';
    const chunkSize = 3;
    
    for (let i = 0; i < commands.length; i += chunkSize) {
      const chunk = commands.slice(i, i + chunkSize);
      result += `│ │ ${chunk.map(cmd => `${usedPrefix}${cmd}`).join(' ')} \n`;
    }
    
    return result.trim();
  };
  
  // Build the menu
  let menuText = `
╭━━━「 *REACTION GIFS* 」━━━
│
│ Express yourself with fun animated GIFs!
│ Usage: ${usedPrefix}commandname [@mention]
│`;

  // Add positive emotions section if not empty
  if (positiveEmotions.length > 0) {
    menuText += `
├ *POSITIVE EMOTIONS*
│ ╭────
${formatCommands(positiveEmotions)}
│ ╰────
│`;
  }
  
  // Add affection section if not empty
  if (affectionInteraction.length > 0) {
    menuText += `
├ *AFFECTION & INTERACTION*
│ ╭────
${formatCommands(affectionInteraction)}
│ ╰────
│`;
  }
  
  // Add negative emotions section if not empty
  if (negativeEmotions.length > 0) {
    menuText += `
├ *NEGATIVE EMOTIONS*
│ ╭────
${formatCommands(negativeEmotions)}
│ ╰────
│`;
  }
  
  // Add playful actions section if not empty
  if (playfulActions.length > 0) {
    menuText += `
├ *PLAYFUL ACTIONS*
│ ╭────
${formatCommands(playfulActions)}
│ ╰────
│`;
  }
  
  // Add other GIFs section if not empty
  if (otherGifs.length > 0) {
    menuText += `
├ *OTHER REACTIONS*
│ ╭────
${formatCommands(otherGifs)}
│ ╰────
│`;
  }
  
  // Add usage examples and footer
  menuText += `
│ Usage examples:
│ ${usedPrefix}hug @user
│ ${usedPrefix}happy
╰━━━━━━━━━━━━━━━━

Reaction GIFs add fun to your conversations! Try them now.
`;

  await conn.reply(m.chat, menuText, m);
};

handler.help = ['gifmenu', 'reactionmenu', 'gifs'];
handler.tags = ['fun', 'main'];
handler.command = /^(gifmenu|reactionmenu|gifs|reactions)$/i;

module.exports = handler;
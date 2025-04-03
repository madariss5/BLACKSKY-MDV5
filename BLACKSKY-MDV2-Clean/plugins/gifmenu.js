/**
 * Reaction GIFs Menu
 * 
 * This plugin provides an easy-to-use menu of all available GIF reactions
 * with clear instructions on how to use them.
 */

const fs = require('fs');
const path = require('path');

const handler = async (m, { conn, usedPrefix }) => {
  // Get the list of available GIFs
  let availableGifs = [];
  try {
    const gifsDir = path.join(process.cwd(), 'gifs');
    if (fs.existsSync(gifsDir)) {
      availableGifs = fs.readdirSync(gifsDir)
        .filter(file => file.endsWith('.gif'))
        .map(file => file.replace('.gif', ''));
    }
  } catch (err) {
    console.error(getMessage('error', lang), err);
  }
  
  // Categorize GIFs
  const emotions = [
    'happy', 'sad', 'angry', 'bored', 'confused', 'excited',
    'sleepy', 'tired', 'shocked', 'nervous', 'panic', 'disgusted',
    'shy', 'jealous', 'smile', 'proud', 'laugh', 'surprised'
  ].filter(gif => availableGifs.includes(gif));
  
  const affection = [
    'hug', 'kiss', 'pat', 'cuddle', 'highfive', 'blush',
    'wave', 'wink', 'poke'
  ].filter(gif => availableGifs.includes(gif));
  
  const actions = [
    'dance', 'bonk', 'slap', 'facepalm', 'yeet', 'punch',
    'bite', 'kill', 'cool', 'hungry', 'greedy'
  ].filter(gif => availableGifs.includes(gif));
  
  // Other GIFs that don't fit in the categories
  const other = availableGifs.filter(gif => 
    !emotions.includes(gif) && 
    !affection.includes(gif) && 
    !actions.includes(gif)
  );
  
  // Create menu text
  const text = `
*╭─❲ 🎬 REACTION GIFS MENU ❳*
│
│ *HOW TO USE:*
│ 1. Type ${usedPrefix}hug to use a reaction
│ 2. Type ${usedPrefix}hug @user to tag someone
│
│ *😊 Emotions:*
${formatCommands(emotions, usedPrefix)}
│
│ *❤️ Affection:*
${formatCommands(affection, usedPrefix)}
│
│ *😜 Actions:*
${formatCommands(actions, usedPrefix)}
${other.length > 0 ? `│\n│ *🎭 Other:*\n${formatCommands(other, usedPrefix)}\n` : ''}
│ *⚠️ Not seeing GIFs?*
│ If GIFs don't appear, try one of these:
│ 1. ${usedPrefix}huggif - Special hug command
│ 2. ${usedPrefix}testgif - Test GIF sending
│
*╰──────────*

Examples:
${usedPrefix}hug @user - Hug someone
${usedPrefix}dance - Show a dance GIF
`;

  // Send the menu text
  await conn.reply(m.chat, text, m);
  
  // Also send a sample GIF to demonstrate
  try {
    const sampleGif = 'hug'; // Use hug as a sample
    const gifPath = path.join(process.cwd(), 'gifs', `${sampleGif}.gif`);
    
    if (fs.existsSync(gifPath)) {
      await conn.sendFile(m.chat, gifPath, `${sampleGif}.gif`, 'Example: Hug Reaction GIF', m);
    }
  } catch (error) {
    console.error('Failed to send sample GIF:', error);
  }
};

// Helper function to format commands in a grid
function formatCommands(commands, prefix) {
  if (commands.length === 0) return '│ None available';
  
  let result = '';
  for (let i = 0; i < commands.length; i += 3) {
    const row = commands.slice(i, i + 3).map(cmd => `${prefix}${cmd}`).join('   ');
    result += `│ ${row}\n`;
  }
  return result;
}

handler.help = ['gifmenu', 'reactmenu', 'gifs'];
handler.tags = ['main', 'fun'];
handler.command = /^(gifmenu|gifs|reactmenu|reactions|reactionmenu|emojimenu|emotemenu)$/i;

module.exports = handler;
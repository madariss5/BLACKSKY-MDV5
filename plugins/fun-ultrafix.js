const { getMessage } = require('../lib/languages');

/**
 * Ultra Fixed GIF Reactions - Ultimate compatibility version
 * Uses direct loading of fixed images instead of processing GIFs
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
  console.log(`[ULTRAFIX] Processing command: ${command}`);
  
  // If showing help
  if (command === 'ultragifs') {
    const gifsDir = path.join(process.cwd(), 'gifs');
    const reactions = fs.readdirSync(gifsDir)
      .filter(file => file.endsWith('.gif'))
      .map(file => file.replace('.gif', ''));
    
    conn.reply(m.chat, `Use these ultra-compatible reaction commands with: ${usedPrefix}ultra[reaction] @user\n\nAvailable: ${reactions.join(', ')}`, m);
    return;
  }
  
  // Extract the reaction name from the command (remove "ultra\\\" prefix)
  const reactionName = command.replace('ultra', '');
  
  // Process the reaction
  try {
    // First, check for JPEG files in case they were pre-converted
    let imagePath = path.join(process.cwd(), 'tmp', `${reactionName}.jpg`);
    
    // If the JPEG doesn't exist, use the GIF
    if (!fs.existsSync(imagePath)) {
      // Create tmp directory if it doesn't exist
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      // Get the GIF file
      const gifPath = path.join(process.cwd(), 'gifs', `${reactionName}.gif`);
      console.log(`[ULTRAFIX] Looking for GIF at: ${gifPath}`);
      
      if (!fs.existsSync(gifPath)) {
        console.log(`[ULTRAFIX] GIF Not found: ${gifPath}`);
        conn.reply(m.chat, `Image for \\\"${reactionName}" Not found`, m);
        return;
      }
      
      // Use the original GIF path since conversion is handled separately
      imagePath = gifPath;
    }
    
    // Get target user (mentioned or replied to)
    let target = '';
    let mentions = [m.sender];
    
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = conn.getName(m.mentionedJid[0]);
      mentions.push(m.mentionedJid[0]);
    } else if (m.quoted) {
      target = conn.getName(m.quoted.sender);
      mentions.push(m.quoted.sender);
    }
    
    // Create caption
    const sender = conn.getName(m.sender);
    let caption;
    
    // craft sure the verb form is correct for the action
    if (reactionName.endsWith('s')) {
      // For verbs already ending in 's' like 'kiss'
      caption = target ? `${sender} ${reactionName}es ${target}` : `${sender} ${reactionName}es`;
    } else if (reactionName === 'hug') {
      caption = target ? `${sender} hugs ${target}` : `${sender} hugs`;
    } else if (reactionName === 'pat') {
      caption = target ? `${sender} pats ${target}` : `${sender} pats`;
    } else if (reactionName === 'cry') {
      caption = `${sender} cries${target ? ' because of '+target : ''}`;
    } else if (reactionName === 'punch') {
      caption = target ? `${sender} punches ${target}` : `${sender} punches`;
    } else {
      // Default format with 's' added
      caption = target ? `${sender} ${reactionName}s ${target}` : `${sender} ${reactionName}s`;
    }
    
    console.log(`[ULTRAFIX] Caption: ${caption}`);
    
    // First send the caption, then the media will follow
    await conn.reply(m.chat, caption, m);
    
    // Read the file buffer
    const buffer = fs.readFileSync(imagePath);
    
    // Try multiple send methods in sequence to ensure one works
    try {
      // METHOD 1: Try sending as image
      await conn.sendMessage(m.chat, { 
        image: buffer,
        mentions: mentions
      }, { quoted: m });
      console.log(`[ULTRAFIX] Image sent successfully via image method`);
      return;
    } catch (imgError) {
      console.log(`[ULTRAFIX] Image method Failed: ${imgError.message}`);
      
      try {
        // METHOD 2: Try sending as document
        await conn.sendMessage(m.chat, {
          document: buffer,
          mimetype: imagePath.endsWith('.gif') ? 'image/gif' : 'image/jpeg',
          fileName: path.basename(imagePath),
          mentions: mentions
        }, { quoted: m });
        console.log(`[ULTRAFIX] Image sent successfully via document method`);
        return;
      } catch (docError) {
        console.log(`[ULTRAFIX] Document method Failed: ${docError.message}`);
      }
    }
    
    // All methods Failed
    console.log(`[ULTRAFIX] All sending methods Failed, but caption was sent`);
  } catch (e) {
    console.error(`[ULTRAFIX] Error: ${e.message}`);
    conn.reply(m.chat, `Error processing reaction: ${e.message}. Try the text version with .${reactionName} instead.`, m);
  }
};

// Build the command list with "ultra\\\" prefix
let reactions = [];
try {
  const gifsDir = path.join(process.cwd(), 'gifs');
  if (fs.existsSync(gifsDir)) {
    reactions = fs.readdirSync(gifsDir)
      .filter(file => file.endsWith('.gif'))
      .map(file => file.replace('.gif', ''));
  }
} catch (e) {
  console.error(`[ULTRAFIX] Error building command list: ${e.message}`);
  reactions = ['hug', 'kiss', 'slap', 'pat', 'bonk', 'bite'];
}

// Create commands with "ultra" prefix only
const commands = ['ultragifs', ...reactions.map(r => `ultra${r}`)];

handler.help = commands;
handler.tags = ['fun'];
// Strictly enforce the 'ultra' prefix to prevent conflict with regular reaction commands
// Using the exact pattern format will ensure it only matches commands that start with "ultra"
handler.command = new RegExp(`^(ultra(?:gifs|${reactions.join('|')}))$`, 'i');

console.log(`[STARTUP] Ultra-compatible GIF reaction commands registered with strict prefix matching`);

}

module.exports = handler;
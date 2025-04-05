/**
 * Base64 Kill Command
 * 
 * This command demonstrates using base64-encoded GIFs with
 * the optimized media sender.
 */

let handler = async (m, { conn, text }) => {
  try {
    // Sample base64 encoded small GIF
    const gifData = 'R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==';
    
    // Convert base64 to buffer
    const gifBuffer = Buffer.from(gifData, 'base64');
    
    // Get user name
    const userName = m.sender.split('@')[0];
    
    // Generate caption
    let caption;
    if (text) {
      caption = `@${userName} has killed ${text} 💀`;
    } else {
      caption = `@${userName} is feeling murderous 🔪`;
    }
    
    // Send the GIF with standard sender
    await conn.sendFile(m.chat, gifBuffer, 'kill.mp4', caption, m, false, {
      mimetype: 'video/mp4',
      gifPlayback: true,
      mentions: [m.sender]
    });
    
  } catch (error) {
    console.error('Error in b64kill command:', error);
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['b64kill [@user]'];
handler.tags = ['reactions', 'fun'];
handler.command = /^b64kill$/i;

module.exports = handler;
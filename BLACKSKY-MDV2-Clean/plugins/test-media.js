const { getMessage } = require('../lib/languages');

/**
 * Test Media Sender
 * 
 * Dieses Plugin testet das Senden von animierten GIFs mit verschiedenen Methoden
 * um das Problem mit verschwommenen und nicht-animierten GIFs zu beheben.
 */

const fs = require('fs');
const path = require('path');

// Simple media sender function
const simpleSender = (conn, jid, buffer, options) => {
  return conn.sendFile(
    jid, 
    buffer, 
    options.filename || 'media.mp4', 
    options.caption || '', 
    options.quoted || null, 
    false, 
    {
      mimetype: options.mimetype || 'video/mp4',
      gifPlayback: options.gifPlayback || false
    }
  );
};

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
  // Nur der Besitzer kann diesen Befehl verwenden
  if (!m.isOwner) return m.reply('⚠️ Diesen Befehl kann nur der Bot-Besitzer verwenden');
  
  // We're using the simple built-in media sender now
  
  try {
    // Standardmäßig verwenden wir den 'kill'-GIF, wenn kein anderer angegeben ist
    const gifName = args[0] || 'kill';
    const gifPath = path.join(process.cwd(), 'gifs', `${gifName}.gif`);
    
    // Überprüfe, ob die Datei existiert
    if (!fs.existsSync(gifPath)) {
      return m.reply(`❌ GIF-Datei "${gifName}.gif\\" wurde nicht gefunden. Verfügbare GIFs:\n${await listAvailableGifs()}`);
    }
    
    // Informiere den Benutzer, dass wir den GIF senden werden
    await m.reply(`🔄 Sende \\"${gifName}.gif" mit Methode: Standard-GIF-Sender...`);
    
    // Lese die GIF-Datei
    const gifBuffer = fs.readFileSync(gifPath);
    
    // Erstelle die Message-Options
    const options = {
      caption: `Test GIF: ${gifName}`,
      quoted: m,
      filename: `${gifName}.mp4`,
      mimetype: 'video/mp4', // Wichtig für animierte GIFs
      gifPlayback: true      // Aktiviert die GIF-Wiedergabe
    };
    
    // Verwende den standard Media-Sender für das Senden
    await simpleSender(conn, m.chat, gifBuffer, options);
    
    // Informiere den Benutzer, dass das GIF gesendet wurde
    await m.reply(getMessage('success_generic', lang, { message: 'Test abgeschlossen. Ist das GIF jetzt richtig animiert?' }));
    
  } catch (error) {
    console.error('Error in test-media command:', error);
    await m.reply(`❌ Fehler beim Senden des Mediums: ${error.message}`);
  }
};

// Hilfsfunktion, um verfügbare GIFs aufzulisten
async function listAvailableGifs() {
  const gifsDir = path.join(process.cwd(), 'gifs');
  try {
    const files = fs.readdirSync(gifsDir);
    return files
      .filter(file => file.endsWith('.gif'))
      .map(file => file.replace('.gif', ''))
      .join(', ');
  } catch (error) {
    console.error('Error listing GIFs:', error);
    return 'Keine GIFs gefunden';
  }
}

handler.help = ['testmedia [gifname]'];
handler.tags = ['owner', 'debug'];
handler.command = /^(testmedia|testgif|mediatest|giftest)$/i;
handler.owner = true;

module.exports = handler;
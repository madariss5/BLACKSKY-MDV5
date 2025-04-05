const { getMessage } = require('../lib/languages');

let fetch = require('node-fetch');
const lann = 'BETABOTZ'; // Replace with your actual API key

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) throw `*🚩 Example:* ${usedPrefix + command} Infinix Hot 40 Pro`;  
  let responseText = '';
    try {
        const fire = await fetch(`https://api.betabotz.eu.org/fire/webzone/gsmarena?query=${text}&apikey=${lann}`);
        let json = await fire.json();
        let spec = json.result.specifications;
        
        responseText += `*${json.result.name}*\n\n`;
        
        responseText += '*Network*\n';
        responseText += `- Technology: ${spec.network.technology}\n`;
        responseText += `- 2G Bands: ${spec.network.bands2g}\n`;
        responseText += `- 3G Bands: ${spec.network.bands3g}\n`;
        responseText += `- 4G Bands: ${spec.network.bands4g}\n\n`;
        
        responseText += '*Platform*\n';
        responseText += `- Chipset: ${spec.platform.chipset}\n`;
        responseText += `- CPU: ${spec.platform.cpu}\n`;
        responseText += `- GPU: ${spec.platform.gpu}\n`;
        responseText += `- OS: ${spec.platform.os}\n\n`;
        
        responseText += '*Body*\n';
        responseText += `- Dimensions: ${spec.body.dimensions}\n`;
        responseText += `- Weight: ${spec.body.weight}\n`;
        responseText += `- Build: ${spec.body.build}\n`;
        responseText += `- SIM: ${spec.body.sim}\n\n`;
        
        responseText += '*Display*\n';
        responseText += `- Type: ${spec.display.Type}\n`;
        responseText += `- Size: ${spec.display.size}\n`;
        responseText += `- Resolution: ${spec.display.resolution}\n\n`;
        
        responseText += '*Memory*\n';
        responseText += `- Card Slot: ${spec.memory.cardSlot}\n`;
        responseText += `- Internal: ${spec.memory.internal}\n\n`;
        
        responseText += '*Main Camera*\n';
        responseText += `- Dual: ${spec.mainCamera.dual}\n`;
        responseText += `- Features: ${spec.mainCamera.features}\n`;
        responseText += `- video: ${spec.mainCamera.video}\n\n`;
        
        responseText += '*Battery*\n';
        responseText += `- Type: ${spec.battery.Type}\n`;
        responseText += `- Charging: ${spec.battery.charging}\n\n`;
        
        responseText += '*Features*\n';
        responseText += `- Sensors: ${spec.features.sensors}\n\n`;
        
        responseText += '*Colors*\n';
        responseText += spec.colors.join(', ') + '\n\n';
        
        responseText += '*Performance*\n';
        responseText += spec.performance.join('\n') + '\n\n';
        
        responseText += `*Preview:* ${json.result.image}\n`;
        
        await conn.relayMessage(m.chat, {
          extendedTextMessage: {
            text: responseText,
            contextInfo: {
              externalAdReply: {
                title: 'DEVICE INFORMATION',
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: json.result.image,
                sourceUrl: json.result.url
              }
            },
            mentions: [m.sender]
          }
        }, {});
  } catch (e) {
    throw `🚩 *Failed Memuat Data!*`;
  }
};

handler.command = handler.help = ['spek','gsmarena','spesifikasi'];
handler.tags = ['internet'];
handler.premium = false;
handler.group = false;
handler.limit = true;

module.exports = handler;

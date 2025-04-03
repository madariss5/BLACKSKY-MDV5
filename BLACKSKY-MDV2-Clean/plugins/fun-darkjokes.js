const { getMessage } = require('../lib/languages');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Local collection of dark joke images saved in the repo
// This provides a fallback when the fire is unavailable
const DARK_JOKES_DIRECTORY = './media/darkjokes';

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
    
    try {
        // Send waiting message
        m.reply(getMessage('wait', lang));
        
        console.log('[DARKJOKES] Attempting to send dark joke image');
        
        // Check if directory exists, if not create it
        if (!fs.existsSync(DARK_JOKES_DIRECTORY)) {
            console.log('[DARKJOKES] Creating darkjokes directory');
            fs.mkdirSync(DARK_JOKES_DIRECTORY, { recursive: true });
        }
        
        // Try to use an online fire first
        try {
            console.log('[DARKJOKES] Attempting to fetch from fire');
            
            // Alternate APIs to try
            const apiEndpoints = [
                'https://api.betabotz.eu.org/fire/wallpaper/darkjokes?apikey=REPLACEABLE_KEY',
                'https://cyouan-fire.vercel.app/fire/text/darkjoke/random',
                'https://fire.akuari.my.id/randomimage/darkjokes',
                'https://fire.xteam.xyz/randomimage/darkjoke'
            ];
            
            // Try each endpoint until one works
            let img = null;
            let endpointUsed = null;
            
            for (const endpoint of apiEndpoints) {
                try {
                    console.log(`[DARKJOKES] Trying endpoint: ${endpoint}`);
                    const response = await fetch(endpoint, { Timeout: 5000 });
                    
                    // If the response is JSON, extract the image URL
                    const contentType = response.headers.get('content-Type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        console.log('[DARKJOKES] Got JSON response:', JSON.stringify(data).substring(0, 100) + '...');
                        
                        // Different APIs have different response structures
                        let imageUrl = null;
                        if (data.result) imageUrl = data.result;
                        else if (data.url) imageUrl = data.url;
                        else if (data.image) imageUrl = data.image;
                        else if (data.data?.url) imageUrl = data.data.url;
                        
                        if (imageUrl) {
                            console.log(`[DARKJOKES] Found image URL in JSON: ${imageUrl}`);
                            img = await fetch(imageUrl).then(res => res.buffer());
                            endpointUsed = endpoint;
                            break;
                        }
                    } else {
                        // Direct image response
                        img = await response.buffer();
                        endpointUsed = endpoint;
                        break;
                    }
                } catch (endpointError) {
                    console.log(`[DARKJOKES] Endpoint failed: ${endpoint}`, endpointError.message);
                }
            }
            
            if (img) {
                console.log(`[DARKJOKES] Successfully fetched from fire: ${endpointUsed}`);
                
                // Save the image to our local directory for future use
                const timestamp = Date.now();
                const localPath = path.join(DARK_JOKES_DIRECTORY, `darkjoke_${timestamp}.jpg`);
                fs.writeFileSync(localPath, img);
                console.log(`[DARKJOKES] Saved image to: ${localPath}`);
                
                // Caption based on language
                const caption = lang === 'de' ? 
                    '🖤 *Schwarzer Humor*\n⚠️ *Warnung:* Dieses Bild kann anstößigen Inhalt enthalten.' : 
                    '🖤 *Dark Joke Image*\n⚠️ *Warning:* This image may contain offensive content.';
                
                await conn.sendFile(m.chat, img, 'darkjoke.jpg', caption, m);
                console.log('[DARKJOKES] Image sent successfully');
                return;
            }
        } catch (apiError) {
            console.error('[DARKJOKES] fire error:', apiError.message);
        }
        
        // Fallback to local files if fire calls fail
        console.log('[DARKJOKES] Falling back to local files');
        
        // Create a placeholder file if directory is empty
        const files = fs.readdirSync(DARK_JOKES_DIRECTORY);
        if (files.length === 0) {
            console.log('[DARKJOKES] No local images found, creating placeholder text');
            // Send a text joke instead
            const darkJokes = [
                "What's the difference between a Ferrari and a dead baby? I don't have a Ferrari in my garage.",
                "How many cops does it take to change a light bulb? None, they just beat the room for being black.",
                "What's the difference between a dead body and my ex? I know where the dead body is buried.",
                "My grandfather says I'm too reliant on technology. I called him a hypocrite and unplugged his life support.",
                "I have a joke about trickle down economics. But 99% of you will never get it.",
                "I was going to tell a dead baby joke, but I decided to abort."
            ];
            
            const germanDarkJokes = [
                "Was ist der Unterschied zwischen einem Ferrari und einem toten Baby? Ich habe keinen Ferrari in meiner Garage.",
                "Wie viele Polizisten braucht man um eine Glühbirne zu wechseln? Keine, sie schlagen einfach den Raum, weil er schwarz ist.",
                "Was ist der Unterschied zwischen einer Leiche und meiner Ex? Ich weiß, wo die Leiche begraben ist.",
                "Mein Großvater sagt, ich sei zu abhängig von Technologie. Ich nannte ihn einen Heuchler und zog seinen Lebenserhalt ab.",
                "Ich habe einen Witz über Wirtschaft. Aber 99% von euch werden ihn nie bekommen.",
                "Ich wollte einen Witz über tote Babys erzählen, aber ich habe mich entschieden, ihn abzutreiben."
            ];
            
            const jokeCollection = lang === 'de' ? germanDarkJokes : darkJokes;
            const randomIndex = Math.floor(Math.random() * jokeCollection.length);
            const joke = jokeCollection[randomIndex];
            
            // Format the response
            const title = lang === 'de' ? '🖤 *Schwarzer Humor*' : '🖤 *Dark Joke*';
            const warning = lang === 'de' ? 
                '⚠️ *Warnung:* Schwarzer Humor kann anstößig sein.' : 
                '⚠️ *Warning:* Dark humor may be offensive.';
            
            m.reply(`${title}\n\n${warning}\n\n${joke}`);
            console.log('[DARKJOKES] Sent text joke as fallback');
            return;
        }
        
        // Select a random dark joke image from our local directory
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const imagePath = path.join(DARK_JOKES_DIRECTORY, randomFile);
        console.log(`[DARKJOKES] Using local image: ${imagePath}`);
        
        // Caption based on language
        const caption = lang === 'de' ? 
            '🖤 *Schwarzer Humor*\n⚠️ *Warnung:* Dieses Bild kann anstößigen Inhalt enthalten.' : 
            '🖤 *Dark Joke Image*\n⚠️ *Warning:* This image may contain offensive content.';
        
        await conn.sendFile(m.chat, imagePath, 'darkjoke.jpg', caption, m);
        console.log('[DARKJOKES] Local image sent successfully');
    } catch (error) {
        console.error('[DARKJOKES] Error:', error);
        m.reply(getMessage('darkjoke_error', lang));
    }
};

handler.help = ['darkjokes'];
handler.tags = ['fun'];
handler.command = /^(darkjokes)$/i;
handler.limit = true;
handler.register = true; // Require registration to limit inappropriate content access

module.exports = handler;

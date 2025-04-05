/**
 * NSFW Helper Module
 * Provides utilities for fetching and sending NSFW content safely
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const fetch = require('node-fetch');

/**
 * API endpoints for different NSFW categories
 */
const apiEndpoints = {
    // Using nekos.life and hmtai APIs for NSFW content
    ass: 'https://api.waifu.pics/nsfw/trap',   // Using trap as a substitute
    boobs: 'https://api.waifu.pics/nsfw/waifu', // Using general waifu NSFW as substitute
    pussy: 'https://api.waifu.pics/nsfw/trap',  // Using trap as a substitute
    cum: 'https://api.waifu.pics/nsfw/waifu',   // Using general waifu NSFW as substitute
    hentai: 'https://api.waifu.pics/nsfw/waifu', // General NSFW anime content
    neko: 'https://api.waifu.pics/nsfw/neko',    // Neko (catgirl) NSFW content
    // New NSFW categories
    lingerie: 'https://api.waifu.pics/nsfw/waifu', // Using waifu as substitute for lingerie
    cosplay: 'https://api.waifu.pics/nsfw/waifu',  // Using waifu as substitute for cosplay
    uniform: 'https://api.waifu.pics/nsfw/waifu',  // Using waifu as substitute for uniform
    swimsuit: 'https://api.waifu.pics/nsfw/waifu', // Using waifu as substitute for swimsuit
};

/**
 * Alternative URLs if the primary ones fail
 */
const backupEndpoints = {
    ass: 'https://api.waifu.pics/nsfw/trap',
    boobs: 'https://api.waifu.pics/nsfw/waifu',
    pussy: 'https://api.waifu.pics/nsfw/trap',
    cum: 'https://api.waifu.pics/nsfw/waifu',
    hentai: 'https://api.waifu.pics/nsfw/waifu',
    neko: 'https://api.waifu.pics/nsfw/neko',
    // New NSFW categories backups
    lingerie: 'https://api.waifu.pics/nsfw/waifu',
    cosplay: 'https://api.waifu.pics/nsfw/waifu',
    uniform: 'https://api.waifu.pics/nsfw/waifu',
    swimsuit: 'https://api.waifu.pics/nsfw/waifu',
};

/**
 * Check if the chat is allowed to receive NSFW content
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @returns {boolean} - Whether NSFW is allowed in this chat
 */
async function isNsfwAllowed(m, conn) {
    // Skip NSFW check if in private chat
    if (!m.isGroup) return true;
    
    // Log for debugging
    console.log(`[NSFW CHECK] Checking if NSFW is allowed in chat ${m.chat}`);
    
    try {
        // Make sure the chats object exists
        if (!global.db.data.chats) {
            console.log(`[NSFW CHECK] Chats object doesn't exist in global.db.data, creating it`);
            global.db.data.chats = {};
        }
        
        // Make sure the chat entry exists
        if (!global.db.data.chats[m.chat]) {
            console.log(`[NSFW CHECK] Chat ${m.chat} doesn't exist in database, creating it`);
            global.db.data.chats[m.chat] = {};
        }
        
        // Get the chat data
        const chat = global.db.data.chats[m.chat];
        
        // Log the current state (add more type debugging)
        console.log(`[NSFW CHECK] Current NSFW state for chat ${m.chat}: ${chat.nsfw}`);
        console.log(`[NSFW CHECK] Type of nsfw value: ${typeof chat.nsfw}`);
        
        // Thorough checks for different truthy values
        if (chat.nsfw === true || 
            chat.nsfw === 1 || 
            chat.nsfw === "true" || 
            chat.nsfw === "1" || 
            chat.nsfw === "on" || 
            chat.nsfw === "yes") {
            console.log(`[NSFW CHECK] NSFW is enabled for chat ${m.chat} with value: ${chat.nsfw}`);
            return true;
        }
        
        // Fix the value if it's stored in an invalid format but should be true
        if (chat.nsfw && typeof chat.nsfw !== 'boolean') {
            try {
                // Convert to proper boolean and save it
                chat.nsfw = true;
                console.log(`[NSFW CHECK] Fixed NSFW value to proper boolean true`);
                return true;
            } catch (e) {
                console.log(`[NSFW CHECK] Failed to fix NSFW value: ${e.message}`);
            }
        }
        
        // If nsfw property doesn't exist or is false
        console.log(`[NSFW CHECK] NSFW is not enabled for chat ${m.chat}`);
        return false;
    } catch (error) {
        console.error(`[NSFW CHECK] Error checking NSFW state: ${error.message}`);
        // Default to false on error
        return false;
    }
}

/**
 * Toggle NSFW for a specific chat
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @param {boolean} state - The new state (true to enable, false to disable)
 * @returns {string} - Result message
 */
async function toggleNsfw(m, conn, state) {
    try {
        // Use strict boolean check since undefined or null should default to false
        state = state === true ? true : false;
        
        console.log(`[NSFW] Attempting to toggle NSFW to ${state ? 'enabled' : 'disabled'} for chat ${m.chat}`);
        console.log(`[NSFW] DB Data exists: ${global.db?.data ? 'yes' : 'no'}`);
        
        // Initialize database structure if it doesn't exist
        if (!global.db || !global.db.data) {
            console.log('[NSFW] Database structure not found, initializing...');
            if (!global.db) global.db = {};
            global.db.data = {
                users: {},
                chats: {},
                stats: {},
                msgs: {},
                sticker: {},
                settings: {}
            };
        }
        
        // Initialize chat in database if needed
        if (!global.db.data.chats) {
            console.log('[NSFW] Chats object not found in database, creating it');
            global.db.data.chats = {};
        }
        
        // Create chat entry if it doesn't exist
        if (!global.db.data.chats[m.chat]) {
            console.log(`[NSFW] Creating new chat entry for ${m.chat}`);
            global.db.data.chats[m.chat] = {};
        }
        
        // Log the current state before modification
        const currentState = global.db.data.chats[m.chat].nsfw;
        console.log(`[NSFW] Current state for chat ${m.chat}: ${currentState}`);
        
        // Set the NSFW state multiple ways to ensure it sticks
        
        // Method 1: Direct assignment
        global.db.data.chats[m.chat].nsfw = state;
        console.log(`[NSFW] Method 1: Direct assignment completed`);
        
        // Method 2: Using Object.defineProperty
        Object.defineProperty(global.db.data.chats[m.chat], 'nsfw', {
            value: state,
            writable: true,
            enumerable: true,
            configurable: true
        });
        console.log(`[NSFW] Method 2: Object.defineProperty completed`);
        
        // Method 3: Using delete then recreate (clears any potential getter/setter problems)
        try {
            delete global.db.data.chats[m.chat].nsfw;
            global.db.data.chats[m.chat].nsfw = state;
            console.log(`[NSFW] Method 3: Delete and recreate completed`);
        } catch (deleteErr) {
            console.error(`[NSFW] Method 3 failed:`, deleteErr);
        }
        
        console.log(`[NSFW] Successfully set NSFW to ${state ? 'true' : 'false'} for chat ${m.chat}`);
        
        // Verify the change was made
        const verifyState = global.db.data.chats[m.chat].nsfw;
        console.log(`[NSFW] Verified state after update: ${verifyState}`);
        
        // Force save database using multiple methods to ensure persistence
        const fs = require('fs');
        const path = require('path');
        const { promisify } = require('util');
        const writeFileAsync = promisify(fs.writeFile);
        
        let saveSuccess = false;
        
        // Method 1: Using standard write function
        try {
            if (typeof global.db.write === 'function') {
                await global.db.write();
                console.log('[NSFW] Database saved with db.write() method');
                saveSuccess = true;
            }
        } catch (writeErr) {
            console.error('[NSFW] Error saving with db.write():', writeErr);
        }
        
        // Method 2: Using chain().write() if available (for lowdb)
        if (!saveSuccess) {
            try {
                if (global.db.chain && typeof global.db.chain === 'function' && 
                    typeof global.db.chain().write === 'function') {
                    await global.db.chain().write();
                    console.log('[NSFW] Database saved with db.chain().write() method');
                    saveSuccess = true;
                }
            } catch (chainErr) {
                console.error('[NSFW] Error saving with chain().write():', chainErr);
            }
        }
        
        // Method 3: Using direct file write as fallback
        if (!saveSuccess) {
            try {
                const dbPath = path.join(process.cwd(), 'database.json');
                const dbData = JSON.stringify(global.db.data, null, 2);
                await writeFileAsync(dbPath, dbData);
                console.log('[NSFW] Database saved directly to file');
                saveSuccess = true;
            } catch (fileErr) {
                console.error('[NSFW] Error with direct file save:', fileErr);
            }
        }
        
        // Method 4: Emergency sync save (last resort)
        if (!saveSuccess) {
            try {
                const dbPath = path.join(process.cwd(), 'database.json');
                const dbData = JSON.stringify(global.db.data, null, 2);
                fs.writeFileSync(dbPath, dbData);
                console.log('[NSFW] Emergency sync save completed');
                saveSuccess = true;
            } catch (syncErr) {
                console.error('[NSFW] All save methods failed:', syncErr);
            }
        }
        
        // Get user's language for response
        const user = global.db.data.users?.[m.sender];
        const chat = global.db.data.chats?.[m.chat];
        const lang = user?.language || chat?.language || global.language || 'en';
        
        // Response messages based on save status and language
        if (!saveSuccess) {
            if (lang === 'de') {
                return state 
                    ? '⚠️ NSFW-Befehle wurden aktiviert, aber es gab Probleme beim Speichern der Einstellungen. Verwende .nsfwforce on falls nötig.'
                    : '⚠️ NSFW-Befehle wurden deaktiviert, aber es gab Probleme beim Speichern der Einstellungen. Verwende .nsfwforce off falls nötig.';
            } else {
                return state 
                    ? '⚠️ NSFW commands have been enabled but there were issues saving the settings. Use .nsfwforce on if needed.'
                    : '⚠️ NSFW commands have been disabled but there were issues saving the settings. Use .nsfwforce off if needed.';
            }
        } else {
            if (lang === 'de') {
                return state 
                    ? '✅ NSFW-Befehle wurden in diesem Chat aktiviert'
                    : '❌ NSFW-Befehle wurden in diesem Chat deaktiviert';
            } else {
                return state 
                    ? '✅ NSFW commands have been enabled in this chat'
                    : '❌ NSFW commands have been disabled in this chat';
            }
        }
    } catch (error) {
        console.error('[NSFW] Error in toggleNsfw function:', error);
        return `❌ Error toggling NSFW state: ${error.message}`;
    }
}

/**
 * Fetch NSFW content for a specific category
 * @param {string} category - NSFW category
 * @returns {string|null} - URL to the NSFW image or null if failed
 */
async function fetchNsfwContent(category) {
    try {
        // Get the appropriate API endpoint
        const endpoint = apiEndpoints[category.toLowerCase()] || apiEndpoints.hentai;
        
        // Fetch data from the API
        const response = await axios.get(endpoint);
        
        // Extract the image URL from the response
        if (response.data && response.data.url) {
            return response.data.url;
        }
        
        throw new Error('Invalid API response format');
    } catch (error) {
        console.error(`[NSFW] Error fetching ${category} content:`, error.message);
        
        // Try backup endpoint if main one fails
        try {
            const backupEndpoint = backupEndpoints[category.toLowerCase()] || backupEndpoints.hentai;
            const backupResponse = await axios.get(backupEndpoint);
            
            if (backupResponse.data && backupResponse.data.url) {
                return backupResponse.data.url;
            }
        } catch (backupError) {
            console.error(`[NSFW] Backup API also failed:`, backupError.message);
        }
        
        return null;
    }
}

/**
 * Download an image from URL to local file or as buffer
 * @param {string} url - Image URL
 * @param {string} [filepath] - Optional destination file path
 * @returns {Promise<Buffer|boolean>} - Image buffer or success status
 */
async function downloadImage(url, filepath) {
    try {
        // Download the image
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        
        const buffer = await response.buffer();
        
        // If filepath is provided, save to file
        if (filepath) {
            // Create temp directory if it doesn't exist
            const tempDir = path.dirname(filepath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            await writeFileAsync(filepath, buffer);
            return true;
        }
        
        // Otherwise return the buffer
        return buffer;
    } catch (error) {
        console.error(`[NSFW] Error downloading image:`, error.message);
        return filepath ? false : null;
    }
}

/**
 * Send NSFW content to chat
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @param {string} category - NSFW category
 * @returns {Promise<void>}
 */
async function sendNsfwContent(m, conn, category) {
    // Check if NSFW is allowed in this chat
    const allowed = await isNsfwAllowed(m, conn);
    if (!allowed) {
        return conn.reply(m.chat, '❌ NSFW commands are not allowed in this chat. An admin can enable them with .nsfw on', m);
    }
    
    // Send typing indicator
    await conn.sendPresenceUpdate('composing', m.chat);
    
    // Send "searching" message
    await conn.reply(m.chat, `🔍 Searching for ${category} content...`, m);
    
    // Fetch NSFW content
    const imageUrl = await fetchNsfwContent(category);
    if (!imageUrl) {
        return conn.reply(m.chat, '❌ Failed to fetch content. Please try again later.', m);
    }
    
    try {
        // Generate a random filename
        const tempFile = path.join(
            process.cwd(), 
            'temp', 
            `nsfw_${category}_${Date.now()}.jpg`
        );
        
        // Download the image
        const downloaded = await downloadImage(imageUrl, tempFile);
        if (!downloaded) {
            return conn.reply(m.chat, '❌ Failed to download image. Please try again later.', m);
        }
        
        // Send the image
        await conn.sendFile(
            m.chat,
            tempFile,
            `${category}.jpg`,
            `🔞 *NSFW - ${category.toUpperCase()}*\n\n_Warning: Adult content_`,
            m
        );
        
        // Delete the temporary file
        try {
            await unlinkAsync(tempFile);
        } catch (unlinkError) {
            console.error(`[NSFW] Error deleting temp file:`, unlinkError.message);
        }
    } catch (error) {
        console.error(`[NSFW] Error sending content:`, error.message);
        
        // As a fallback, send the direct URL
        await conn.reply(m.chat, `⚠️ Couldn't send the image directly. Here's the link:\n${imageUrl}`, m);
    }
}

/**
 * Check if NSFW is enabled for the chat
 * @param {string} chatId - Chat ID to check
 * @returns {boolean} - Whether NSFW is enabled for this chat
 */
function isNSFWEnabled(chatId) {
    try {
        // Safety check for database structure
        if (!global.db || !global.db.data || !global.db.data.chats) {
            console.log('[NSFW CHECK] Database structure not found');
            return false;
        }
        
        // Get chat data
        const chat = global.db.data.chats[chatId];
        if (!chat) {
            console.log(`[NSFW CHECK] Chat ${chatId} not found in database`);
            return false;
        }
        
        // Check for various truthy values
        return chat.nsfw === true || 
               chat.nsfw === 1 || 
               chat.nsfw === "true" || 
               chat.nsfw === "1" || 
               chat.nsfw === "on" || 
               chat.nsfw === "yes";
    } catch (error) {
        console.error(`[NSFW CHECK] Error: ${error.message}`);
        return false;
    }
}

/**
 * Create a handler function for a specific NSFW category
 * @param {string} category - NSFW category
 * @returns {Function} - Handler function
 */
function createNsfwHandler(category) {
    return async function handler(m, { conn }) {
        await sendNsfwContent(m, conn, category);
    };
}

module.exports = {
    isNsfwAllowed,
    toggleNsfw,
    fetchNsfwContent,
    sendNsfwContent,
    createNsfwHandler,
    isNSFWEnabled,
    downloadImage
};
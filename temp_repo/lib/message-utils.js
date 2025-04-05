/**
 * Message Utilities for WhatsApp Bot
 * 
 * This module provides utilities for working with translations 
 * and message formatting.
 */

/**
 * Get a translated message from a custom translation object
 * 
 * @param {Object} translations The translations object containing language-keyed messages
 * @param {string} lang The language code to use
 * @param {string} key The translation key to look up
 * @return {string} The translated message or a fallback
 */
function getMessage(translations, lang = 'en', key) {
    // Check if translations and requested language exist
    if (!translations || !translations[lang]) {
        // If requested language doesn't exist, fall back to English
        if (translations && translations['en'] && translations['en'][key]) {
            return translations['en'][key];
        }
        return `[Missing translation: ${lang}.${key}]`;
    }
    
    // Check if key exists in the requested language
    if (!translations[lang][key]) {
        // If key doesn't exist in requested language, try English
        if (translations['en'] && translations['en'][key]) {
            return translations['en'][key];
        }
        return `[Missing translation key: ${key}]`;
    }
    
    // Return the translated message
    return translations[lang][key];
}

/**
 * Apply replacements to a translated message
 * 
 * @param {string} message The message with placeholders
 * @param {Object} replacements Object with keys matching placeholders and values to replace them
 * @return {string} The message with replacements applied
 */
function applyReplacements(message, replacements = {}) {
    if (!message) return message;
    
    let result = message;
    for (const [placeholder, value] of Object.entries(replacements)) {
        const normalizedPlaceholder = placeholder.startsWith('%') ? placeholder : `%${placeholder}%`;
        result = result.replace(new RegExp(normalizedPlaceholder, 'g'), value);
    }
    
    return result;
}

module.exports = {
    getMessage,
    applyReplacements
};
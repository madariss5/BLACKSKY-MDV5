/**
 * Language Utility Functions
 * This module provides language-related utility functions for the bot.
 */

const fs = require('fs');
const path = require('path');
const { getMessage } = require('../lib/languages.js');

/**
 * Check if a language is supported
 * @param {string} lang - Language code
 * @returns {boolean} - Whether the language is supported
 */
function isLanguageSupported(lang) {
  // Get available languages from config
  const availableLanguages = global.languages || ['en', 'de'];
  return availableLanguages.includes(lang);
}

/**
 * Get list of available languages
 * @returns {string[]} - Array of language codes
 */
function getAvailableLanguages() {
  // Get available languages from config
  return global.languages || ['en', 'de'];
}

/**
 * Get language name from code
 * @param {string} lang - Language code
 * @returns {string} - Full language name
 */
function getLanguageName(lang) {
  const languageNames = {
    'en': 'English',
    'de': 'Deutsch (German)'
  };
  
  return languageNames[lang] || lang;
}

// Export the functions globally to make them available throughout the bot
global.isLanguageSupported = isLanguageSupported;
global.getAvailableLanguages = getAvailableLanguages;
global.getLanguageName = getLanguageName;

// Also export them as module exports
module.exports = {
  isLanguageSupported,
  getAvailableLanguages,
  getLanguageName
};
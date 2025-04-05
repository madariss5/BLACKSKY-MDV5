/**
 * Test Script for Gunshop Translations
 * 
 * This script helps test if the translations are working correctly
 * without having to run the full bot.
 */

const gunshopTranslations = require('./gunshop-translations');

// Helper function to simulate getMessage
function getMessage(translations, lang, key) {
    if (!translations || !translations[lang] || !translations[lang][key]) {
        return `[Missing translation: ${lang}.${key}]`;
    }
    return translations[lang][key];
}

// Languages to test
const languages = ['en', 'de'];

// Keys to test
const keysToTest = [
    'gunshop_title', 
    'gunshop_description',
    'gunshop_usage_example',
    'gunshop_list_weapons',
    'gunshop_buy_not_enough',
    'gunshop_buy_success',
    'gunshop_sell_not_enough',
    'gunshop_sell_success',
    'gunshop_recent_visit',
    'gunshop_jail_warning',
    'gunshop_db_error'
];

// Test all translations
console.log("Testing Gunshop Translations:");
console.log("============================");
for (const lang of languages) {
    console.log(`\n${lang.toUpperCase()} Translations:`);
    console.log("--------------------");
    
    for (const key of keysToTest) {
        const translation = getMessage(gunshopTranslations, lang, key);
        console.log(`${key}: "${translation}"`);
    }
}

// Test placeholder replacements
console.log("\n\nTesting Placeholder Replacements:");
console.log("================================");

const testReplacements = {
    en: {
        key: 'gunshop_buy_success',
        replacements: {
            '%amount%': '5',
            '%item%': '🔫AK47',
            '%payment%': '💵Money'
        }
    },
    de: {
        key: 'gunshop_buy_success',
        replacements: {
            '%amount%': '5',
            '%item%': '🔫AK47',
            '%payment%': '💵Geld'
        }
    }
};

for (const lang of languages) {
    const test = testReplacements[lang];
    console.log(`\n${lang.toUpperCase()} - ${test.key}:`);
    
    let message = getMessage(gunshopTranslations, lang, test.key);
    console.log(`Original: "${message}"`);
    
    // Apply replacements
    for (const [placeholder, value] of Object.entries(test.replacements)) {
        message = message.replace(placeholder, value);
    }
    
    console.log(`With replacements: "${message}"`);
}

console.log("\nTranslation test completed!");
/**
 * Gunshop Translations
 * 
 * This module provides translations for the gunshop functionality
 * in both English and German languages.
 */

const gunshopTranslations = {
  "en": {
    // Shop title and descriptions
    "gunshop_title": "🏪 Gun Shop",
    "gunshop_description": "Want to use the weapon shop?\nType _.buygun_ if you want to buy a weapon!\nType _.sellgun_ if you want to sell a weapon!",
    
    // Command usage and lists
    "gunshop_usage_example": "Example Usage: %prefix%%command% ak47 1",
    "gunshop_list_weapons": "List of weapons:",
    
    // Buy messages
    "gunshop_buy_not_enough": "You don't have enough %payment% to buy *%amount%* %item%. You need *%needed%* more %payment% to be able to buy",
    "gunshop_buy_success": "You have bought *%amount%* %item% using %payment%",
    
    // Sell messages
    "gunshop_sell_not_enough": "You don't have enough *%item%* to sell. You only have %available% items",
    "gunshop_sell_success": "You have sold *%amount%* %item% and received *%reward%* %payment%",
    
    // Errors and restrictions
    "gunshop_recent_visit": "You just went to the shop! Wait for *%time%*",
    "gunshop_jail_warning": "You cannot perform activities because you are still in jail!",
    "gunshop_db_error": "User does not have %reward% in their database, but giving it as a reward!"
  },
  "de": {
    // Shop title and descriptions
    "gunshop_title": "🏪 Waffengeschäft",
    "gunshop_description": "Möchtest du den Waffenladen nutzen?\nTippe _.buygun_ wenn du eine Waffe kaufen möchtest!\nTippe _.sellgun_ wenn du eine Waffe verkaufen möchtest!",
    
    // Command usage and lists
    "gunshop_usage_example": "Verwendungsbeispiel: %prefix%%command% ak47 1",
    "gunshop_list_weapons": "Liste der Waffen:",
    
    // Buy messages
    "gunshop_buy_not_enough": "Du hast nicht genug %payment%, um *%amount%* %item% zu kaufen. Du benötigst noch *%needed%* %payment% um kaufen zu können",
    "gunshop_buy_success": "Du hast *%amount%* %item% mit %payment% gekauft",
    
    // Sell messages
    "gunshop_sell_not_enough": "Du hast nicht genug *%item%* zum Verkaufen. Du besitzt nur %available% Stück",
    "gunshop_sell_success": "Du hast *%amount%* %item% verkauft und *%reward%* %payment% erhalten",
    
    // Errors and restrictions
    "gunshop_recent_visit": "Du warst gerade erst im Laden! Warte *%time%*",
    "gunshop_jail_warning": "Du kannst keine Aktivitäten durchführen, weil du noch im Gefängnis bist!",
    "gunshop_db_error": "Benutzer hat kein %reward% in der Datenbank, aber es wird als Belohnung gegeben!"
  }
};

module.exports = gunshopTranslations;
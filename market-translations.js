/**
 * Market/Shop System Translations
 * 
 * This module provides translations for the market/shop functionality
 * in both English and German languages.
 */

const marketTranslations = {
  "en": {
    // Market listings
    "market_title": "📊 Market",
    "market_subtitle": "Available items for purchase:",
    "market_item_format": "%emoji% %item_name%: %price% %currency%",
    "market_footer": "Use '%prefix%buy <item> <amount>' to purchase items",
    
    // Buy/Sell messages
    "buy_success": "You have purchased *%amount%x %item%* for *%total%* %currency%",
    "buy_not_enough_money": "You don't have enough %currency%.\nYou need *%price%* %currency%, but you only have *%balance%* %currency%",
    "buy_not_available": "This item is not available in the shop!",
    "buy_invalid_amount": "Please enter a valid amount to purchase",
    "buy_invalid_format": "Invalid format. Use '%prefix%buy <item> <amount>'",
    "buy_confirm": "Are you sure you want to buy *%amount%x %item%* for *%total%* %currency%?",
    
    "sell_success": "You have sold *%amount%x %item%* and received *%total%* %currency%",
    "sell_not_enough_items": "You don't have enough %item%. You only have *%balance%* in your inventory",
    "sell_not_sellable": "This item cannot be sold!",
    "sell_invalid_amount": "Please enter a valid amount to sell",
    "sell_invalid_format": "Invalid format. Use '%prefix%sell <item> <amount>'",
    "sell_confirm": "Are you sure you want to sell *%amount%x %item%* for *%total%* %currency%?",
    
    // Inventory
    "inventory_title": "🎒 Your Inventory",
    "inventory_empty": "Your inventory is empty!",
    "inventory_item_format": "%emoji% %item_name%: %amount%",
    "inventory_footer": "Use '%prefix%use <item> <amount>' to use items",
    
    // Market admin commands
    "market_add_success": "Successfully added *%item%* to the market for *%price%* %currency%",
    "market_remove_success": "Successfully removed *%item%* from the market",
    "market_price_update": "Updated price of *%item%* to *%price%* %currency%"
  },
  "de": {
    // Market listings
    "market_title": "📊 Markt",
    "market_subtitle": "Verfügbare Artikel zum Kauf:",
    "market_item_format": "%emoji% %item_name%: %price% %currency%",
    "market_footer": "Verwende '%prefix%buy <Artikel> <Anzahl>' um Artikel zu kaufen",
    
    // Buy/Sell messages
    "buy_success": "Du hast *%amount%x %item%* für *%total%* %currency% gekauft",
    "buy_not_enough_money": "Du hast nicht genug %currency%.\nDu benötigst *%price%* %currency%, aber du hast nur *%balance%* %currency%",
    "buy_not_available": "Dieser Artikel ist nicht im Shop verfügbar!",
    "buy_invalid_amount": "Bitte gib eine gültige Menge zum Kaufen ein",
    "buy_invalid_format": "Ungültiges Format. Verwende '%prefix%buy <Artikel> <Anzahl>'",
    "buy_confirm": "Bist du sicher, dass du *%amount%x %item%* für *%total%* %currency% kaufen möchtest?",
    
    "sell_success": "Du hast *%amount%x %item%* verkauft und *%total%* %currency% erhalten",
    "sell_not_enough_items": "Du hast nicht genug %item%. Du hast nur *%balance%* in deinem Inventar",
    "sell_not_sellable": "Dieser Artikel kann nicht verkauft werden!",
    "sell_invalid_amount": "Bitte gib eine gültige Menge zum Verkaufen ein",
    "sell_invalid_format": "Ungültiges Format. Verwende '%prefix%sell <Artikel> <Anzahl>'",
    "sell_confirm": "Bist du sicher, dass du *%amount%x %item%* für *%total%* %currency% verkaufen möchtest?",
    
    // Inventory
    "inventory_title": "🎒 Dein Inventar",
    "inventory_empty": "Dein Inventar ist leer!",
    "inventory_item_format": "%emoji% %item_name%: %amount%",
    "inventory_footer": "Verwende '%prefix%use <Artikel> <Anzahl>' um Artikel zu verwenden",
    
    // Market admin commands
    "market_add_success": "Erfolgreich *%item%* zum Markt für *%price%* %currency% hinzugefügt",
    "market_remove_success": "Erfolgreich *%item%* vom Markt entfernt",
    "market_price_update": "Preis von *%item%* auf *%price%* %currency% aktualisiert"
  }
};

module.exports = marketTranslations;
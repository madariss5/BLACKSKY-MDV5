/**
 * RPG Module Translations
 * 
 * This module provides translations for various RPG commands and messages
 * in both English and German languages.
 */

const rpgTranslations = {
  "en": {
    // Common messages
    "rpg_cooldown": "You have to wait *%time%* before using this command again",
    "rpg_jail_warning": "You cannot perform activities because you are still in jail!",
    "rpg_success": "Success! %message%",
    "rpg_failed": "Failed! %message%",
    "rpg_not_enough": "You don't have enough %item% to continue",
    "rpg_received": "You have received *%amount%* %item%",
    "rpg_used": "You have used *%amount%* %item%",
    "rpg_wait": "Please wait *%time%* before doing this activity again",
    
    // Work related
    "rpg_work_start": "Finding a job...",
    "rpg_work_success": "You have worked and earned *%amount%* %reward%",
    "rpg_work_tired": "You are too tired to work now. Please rest for *%time%*",
    
    // Trade/Shop related
    "rpg_buy_success": "You have bought *%amount%* %item% for %price% %currency%",
    "rpg_sell_success": "You have sold *%amount%* %item% and received *%reward%* %currency%",
    "rpg_buy_not_enough": "You don't have enough %currency% to buy *%amount%* %item%. You need *%needed%* more %currency%",
    "rpg_sell_not_enough": "You don't have enough *%item%* to sell. You only have %available% items",
    
    // Inventory/Status
    "rpg_inventory_title": "🎒 Inventory",
    "rpg_status_title": "📊 Status",
    "rpg_not_registered": "You are not registered in the database!",
    
    // Job-specific
    "rpg_taxi_start": "Finding passengers...",
    "rpg_taxi_success": "You have completed a taxi ride and earned *%amount%* money",
    "rpg_mining_start": "⛏️ Mining...",
    "rpg_mining_success": "You have mined and obtained *%amount%* %item%",
    "rpg_farming_start": "🌱 Farming...",
    "rpg_farming_success": "You have harvested *%amount%* %item% from your farm",
    "rpg_fishing_start": "🎣 Fishing...",
    "rpg_fishing_success": "You have caught *%amount%* %item%",
    "rpg_woodcutting_start": "🪓 Woodcutting...",
    "rpg_woodcutting_success": "You have chopped *%amount%* wood"
  },
  "de": {
    // Common messages
    "rpg_cooldown": "Du musst *%time%* warten, bevor du diesen Befehl erneut verwenden kannst",
    "rpg_jail_warning": "Du kannst keine Aktivitäten durchführen, weil du noch im Gefängnis bist!",
    "rpg_success": "Erfolg! %message%",
    "rpg_failed": "Fehlgeschlagen! %message%",
    "rpg_not_enough": "Du hast nicht genug %item% um fortzufahren",
    "rpg_received": "Du hast *%amount%* %item% erhalten",
    "rpg_used": "Du hast *%amount%* %item% verwendet",
    "rpg_wait": "Bitte warte *%time%* bevor du diese Aktivität erneut durchführst",
    
    // Work related
    "rpg_work_start": "Suche nach Arbeit...",
    "rpg_work_success": "Du hast gearbeitet und *%amount%* %reward% verdient",
    "rpg_work_tired": "Du bist zu müde, um jetzt zu arbeiten. Bitte ruhe dich für *%time%* aus",
    
    // Trade/Shop related
    "rpg_buy_success": "Du hast *%amount%* %item% für %price% %currency% gekauft",
    "rpg_sell_success": "Du hast *%amount%* %item% verkauft und *%reward%* %currency% erhalten",
    "rpg_buy_not_enough": "Du hast nicht genug %currency%, um *%amount%* %item% zu kaufen. Du benötigst noch *%needed%* %currency%",
    "rpg_sell_not_enough": "Du hast nicht genug *%item%* zum Verkaufen. Du besitzt nur %available% Stück",
    
    // Inventory/Status
    "rpg_inventory_title": "🎒 Inventar",
    "rpg_status_title": "📊 Status",
    "rpg_not_registered": "Du bist nicht in der Datenbank registriert!",
    
    // Job-specific
    "rpg_taxi_start": "Suche nach Fahrgästen...",
    "rpg_taxi_success": "Du hast eine Taxifahrt abgeschlossen und *%amount%* Geld verdient",
    "rpg_mining_start": "⛏️ Bergbau...",
    "rpg_mining_success": "Du hast abgebaut und *%amount%* %item% erhalten",
    "rpg_farming_start": "🌱 Landwirtschaft...",
    "rpg_farming_success": "Du hast *%amount%* %item% von deiner Farm geerntet",
    "rpg_fishing_start": "🎣 Angeln...",
    "rpg_fishing_success": "Du hast *%amount%* %item% gefangen",
    "rpg_woodcutting_start": "🪓 Holzfällen...",
    "rpg_woodcutting_success": "Du hast *%amount%* Holz gehackt"
  }
};

module.exports = rpgTranslations;
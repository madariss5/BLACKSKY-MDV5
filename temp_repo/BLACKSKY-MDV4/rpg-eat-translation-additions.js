/**
 * This file shows the translations that would need to be added to lib/languages.js
 * to support the RPG Eating module in both English and German
 */

// These would be added to the English translations object:
const englishTranslations = {
  // RPG Eating system
  'rpg_eating_menu': `「 *E A T I N G* 」
╭──『 FOOD 』
│⬡ typing command↓
│   %prefix%%command% rendang
│
│⬡ 🍖 *Roasted Chicken* : %ayambakar%
│⬡ 🍗 *Fried Chicken* : %ayamgoreng%
│⬡ 🥘 *Rendang* : %rendang%
│⬡ 🥩 *Steak* : %steak%
│⬡ 🥠 *Roast Pork* : %babipanggang%
│⬡ 🍲 *Chicken Curry* : %gulai%
│⬡ 🍜 *Chicken Opor* : %oporayam%
│⬡ 🍷 *Vodka* : %vodka%
│⬡ 🍣 *Sushi* : %sushi%
│⬡ 💉 *Medicine* : %byouge%
│⬡ ☘️ *Herbs* : %ganja%
│⬡ 🍺 *Soda* : %soda%
│⬡ 🍞 *Bread* : %roti%
│⬡ 🍖 *Grilled Fish* : %ikanbakar%
│⬡ 🍖 *Grilled Catfish* : %lelebakar%
│⬡ 🍖 *Grilled Tilapia* : %nilabakar%
│⬡ 🍖 *Grilled Pomfret* : %bawalbakar%
│⬡ 🍖 *Grilled Shrimp* : %udangbakar%
│⬡ 🍖 *Grilled Whale* : %pausbakar%
│⬡ 🍖 *Grilled Crab* : %kepitingbakar%
╰───────────────
• *Example :* .eat ayamgoreng

`,
  'rpg_eating_sound': 'Nyam nyam',
  'rpg_drinking_sound': 'Glek glek glek',
  'rpg_item_lacking': 'You don\'t have enough %item%',
  'rpg_stamina_full': 'Your stamina is already full',
  'rpg_healt_full': 'Your health is already full',
  
  // RPG item names
  'rpg_item_ayambakar': 'roasted chicken',
  'rpg_item_ayamgoreng': 'fried chicken',
  'rpg_item_rendang': 'rendang',
  'rpg_item_steak': 'steak',
  'rpg_item_babipanggang': 'roast pork',
  'rpg_item_gulai': 'chicken curry',
  'rpg_item_oporayam': 'chicken opor',
  'rpg_item_vodka': 'vodka',
  'rpg_item_sushi': 'sushi',
  'rpg_item_byouge': 'medicine',
  'rpg_item_ganja': 'herbs',
  'rpg_item_soda': 'soda',
  'rpg_item_roti': 'bread',
  
  // Error messages
  'rpg_error_report': 'shop.js error\nUser: *%sender%*\nCommand: *%command%*\n\n*%error%*'
};

// These would be added to the German translations object:
const germanTranslations = {
  // RPG Eating system
  'rpg_eating_menu': `「 *E S S E N* 」
╭──『 SPEISEN 』
│⬡ Befehl eingeben↓
│   %prefix%%command% rendang
│
│⬡ 🍖 *Gebratenes Huhn* : %ayambakar%
│⬡ 🍗 *Brathähnchen* : %ayamgoreng%
│⬡ 🥘 *Rendang* : %rendang%
│⬡ 🥩 *Steak* : %steak%
│⬡ 🥠 *Schweinebraten* : %babipanggang%
│⬡ 🍲 *Hühnercurry* : %gulai%
│⬡ 🍜 *Huhn Opor* : %oporayam%
│⬡ 🍷 *Wodka* : %vodka%
│⬡ 🍣 *Sushi* : %sushi%
│⬡ 💉 *Medizin* : %byouge%
│⬡ ☘️ *Kräuter* : %ganja%
│⬡ 🍺 *Limonade* : %soda%
│⬡ 🍞 *Brot* : %roti%
│⬡ 🍖 *Gegrillter Fisch* : %ikanbakar%
│⬡ 🍖 *Gegrillter Wels* : %lelebakar%
│⬡ 🍖 *Gegrillte Tilapia* : %nilabakar%
│⬡ 🍖 *Gegrillte Goldbrasse* : %bawalbakar%
│⬡ 🍖 *Gegrillte Garnelen* : %udangbakar%
│⬡ 🍖 *Gegrillter Wal* : %pausbakar%
│⬡ 🍖 *Gegrillte Krabbe* : %kepitingbakar%
╰───────────────
• *Beispiel :* .eat ayamgoreng

`,
  'rpg_eating_sound': 'Mampf mampf',
  'rpg_drinking_sound': 'Gluck gluck gluck',
  'rpg_item_lacking': 'Du hast nicht genug %item%',
  'rpg_stamina_full': 'Deine Ausdauer ist bereits voll',
  'rpg_healt_full': 'Deine Gesundheit ist bereits voll',
  
  // RPG item names
  'rpg_item_ayambakar': 'gebratenes Huhn',
  'rpg_item_ayamgoreng': 'Brathähnchen',
  'rpg_item_rendang': 'Rendang',
  'rpg_item_steak': 'Steak',
  'rpg_item_babipanggang': 'Schweinebraten',
  'rpg_item_gulai': 'Hühnercurry',
  'rpg_item_oporayam': 'Huhn Opor',
  'rpg_item_vodka': 'Wodka',
  'rpg_item_sushi': 'Sushi',
  'rpg_item_byouge': 'Medizin',
  'rpg_item_ganja': 'Kräuter',
  'rpg_item_soda': 'Limonade',
  'rpg_item_roti': 'Brot',
  
  // Error messages
  'rpg_error_report': 'shop.js Fehler\nBenutzer: *%sender%*\nBefehl: *%command%*\n\n*%error%*'
};
/**
 * Ojek (Taxi) System Translations
 * 
 * This module provides translations for the ojek/taxi functionality
 * in both English and German languages.
 */

const ojekTranslations = {
  "en": {
    // Status messages
    "ojek_finding_customer": "Finding passengers...",
    "ojek_driving": "🚶🛵⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️       \n\n\n➕ Driving to destination....",
    "ojek_arrived": "⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛🛵⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️       \n\n\n➕ Arrived at destination...",
    "ojek_receiving_payment": "➕ 💹 Receiving payment....",
    "ojek_results": "*—[ Taxi Results for %name% ]—*\n➕ 💹 Money = [ %money% ]\n➕ ✨ Exp = [ %exp% ]                 \n➕ 😍 Completed Orders = +1\n➕ 📥 Previous Total Orders: %orders%\n%wm%",
    
    // Error messages
    "ojek_tired": "You seem too tired. Please rest for about\n*%time%*",
    "ojek_searching": "Searching for customers....."
  },
  "de": {
    // Status messages
    "ojek_finding_customer": "Suche nach Fahrgästen...",
    "ojek_driving": "🚶🛵⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️       \n\n\n➕ Fahre zum Ziel....",
    "ojek_arrived": "⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛🛵⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️       \n\n\n➕ Am Ziel angekommen...",
    "ojek_receiving_payment": "➕ 💹 Erhalte Bezahlung....",
    "ojek_results": "*—[ Taxi-Ergebnisse für %name% ]—*\n➕ 💹 Geld = [ %money% ]\n➕ ✨ Erfahrung = [ %exp% ]                 \n➕ 😍 Abgeschlossene Aufträge = +1\n➕ 📥 Bisherige Aufträge insgesamt: %orders%\n%wm%",
    
    // Error messages
    "ojek_tired": "Du scheinst zu müde zu sein. Bitte ruhe dich etwa\n*%time%* aus",
    "ojek_searching": "Suche nach Kunden....."
  }
};

module.exports = ojekTranslations;
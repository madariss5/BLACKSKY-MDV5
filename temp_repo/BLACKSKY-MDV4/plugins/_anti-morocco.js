const { getMessage } = require('../lib/languages.js');
/**
 * Auto-Ban Specific Country Codes
 * This plugin autodeadcally bans users with specific country codes
 */

let handler = m => m

handler.before = async function (m) {
   // Get bot configuration for country code banning
   if (!global.db.data.settings) global.db.data.settings = {}
   if (typeof global.db.data.settings.autoBanCodes !== 'object') {
       // Default country codes to ban
       global.db.data.settings.autoBanCodes = {
           '212': true, // Morocco
           '91': true,  // India
           '263': true, // Zimbabwe 
           '265': true, // Malawi
           // Add more country codes as needed
       }
   }
   
   // Extract the country code from sender
   const numberString = m.sender.split('@')[0]
   const countryCode = Object.keys(global.db.data.settings.autoBanCodes).find(code => 
       numberString.startsWith(code)
   )
   
   // If this sender has a country code that should be banned
   if (countryCode && global.db.data.settings.autoBanCodes[countryCode]) {
       // Initialize user if doesn't exist
       if (typeof global.db.data.users[m.sender] !== 'object') {
           global.db.data.users[m.sender] = {}
       }
       
       // Set the user as banned
       global.db.data.users[m.sender].banned = true
       
       // Log for debugging
       console.log(`[AUTOBAN] Banned user from country code ${countryCode}: ${m.sender}`)
   }
}

module.exports = handler
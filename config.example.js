global.owner = [
  // Format [number, name, isCreator] - each as separate entries
  ['YOUR_NUMBER_HERE', 'YOUR_NAME', true]
]  
global.mods = ['YOUR_NUMBER_HERE'] 
global.prems = ['YOUR_NUMBER_HERE']
global.nameowner = 'YOUR_NAME'
global.numberowner = 'YOUR_NUMBER_HERE'
global.mail = 'YOUR_EMAIL@example.com' 
global.gc = 'YOUR_GROUP_LINK_HERE'
global.instagram = 'YOUR_INSTAGRAM_LINK'
global.wm = '© 𝔹𝕃𝔸ℂ𝕂𝕊𝕂𝕐-𝕄𝔻'
global.packname = 'Made With'
global.author = '𝔹𝕃𝔸ℂ𝕂𝕊𝕂𝕐-𝕄𝔻'
global.maxwarn = 3 // Maximum warnings (as a number)
global.antiporn = true // Auto delete porn messages (bot must be admin)
global.prefix = '.' // Default command prefix

// XP and leveling system
global.multiplier = 5 // Increase XP requirements (higher = slower leveling, increased from 3)

// Language settings
global.language = 'en' // Default language (en = English, de = German)
global.languages = ['en', 'de'] // Available languages

// Timezone settings
global.timezone = 'Europe/London' // Default timezone for date/time functions

// Settings

//THIS MUST BE FILLED IN!//
global.lann = 'YOUR_API_KEY_HERE' 
//Register first at https://api.betabotz.eu.org

//THIS IS OPTIONAL, CAN BE FILLED OR LEFT EMPTY//
global.btc = 'YOUR_BTC_API_KEY_HERE'
//Register at https://api.betabotz.eu.org

global.APIs = {   
  lann: 'https://api.betabotz.eu.org',
  btc: 'https://api.betabotz.eu.org'
}
global.APIKeys = { 
  'https://api.betabotz.eu.org': global.lann, 
  'https://api.betabotz.eu.org': global.btc //OPTIONAL
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})

// Load custom connection patch
try {
  require('./connection-patch')
  console.log(chalk.greenBright('✅ Connection patch loaded successfully'))
} catch (e) {
  console.log(chalk.redBright('❌ Failed to load connection patch: ' + e.message))
}
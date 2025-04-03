global.owner = [
  // Format [number, name, isCreator] - each as separate entries
  ['4915563151347', 'Martin', true]
]  
global.mods = ['4915563151347'] 
global.prems = ['4915563151347']
global.nameowner = 'Martin'
global.numberowner = '4915563151347'
global.mail = 'support@tioprm.eu.org' 
global.gc = 'https://chat.whatsapp.com/G4f1fTpz9zL4EH3FyIcaPR'
global.instagram = 'https://instagram.com/erlanrahmat_14'
global.wm = '© 𝔹𝕃𝔸ℂ𝕂𝕊𝕂𝕐-𝕄𝔻'
global.packname = 'Made With'
global.author = '𝔹𝕃𝔸ℂ𝕂𝕊𝕂𝕐-𝕄𝔻'
global.maxwarn = 3 // Maximum warnings (as a number)
global.antiporn = true // Auto delete porn messages (bot must be admin)
global.prefix = '.' // Default command prefix

// XP and leveling system
global.multiplier = 5 // Increase XP requirements (higher = slower leveling, increased from 3)

// Language settings
global.language = 'de' // Default language (en = English, de = German)
global.languages = ['de', 'en'] // Available languages

// Timezone settings
global.timezone = 'Europe/Berlin' // Default timezone for date/time functions

// Settings

//THIS MUST BE FILLED IN!//
global.lann = 'Btz-jdyXQ' 
//Register first at https://api.betabotz.eu.org (Note: previously was fire.betabotz.eu.org)

//THIS IS OPTIONAL, CAN BE FILLED OR LEFT EMPTY//
global.btc = 'Btz-jdyXQ'
//Register at https://api.betabotz.eu.org (Note: previously was fire.botcahx.eu.org)

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

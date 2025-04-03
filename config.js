global.owner = [
  // Format [number, name, isCreator] - each as separate entries
  ['12345678901', 'BLACKSKY Admin', true]
]  
global.mods = ['12345678901'] 
global.prems = ['12345678901']
global.nameowner = 'BLACKSKY Admin'
global.numberowner = '12345678901'
global.mail = 'admin@example.com' 
global.gc = 'https://chat.whatsapp.com/example'
global.instagram = 'https://instagram.com/example'
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

// This is a placeholder API key. In a real environment, you would replace this with your actual API key
global.lann = 'demo_api_key' 
// Register first at https://api.betabotz.eu.org

// This is a placeholder API key. In a real environment, you would replace this with your actual API key
global.btc = 'demo_api_key'
// Register at https://api.betabotz.eu.org

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
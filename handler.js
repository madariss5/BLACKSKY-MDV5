
// ================================================
// FIXES AND OPTIMIZATIONS
// ================================================
// This section applies fixes and optimizations
// to improve bot stability and performance
try {
  // Initialize handler patches if not already applied
  if (!global.handlerPatchesApplied) {
    console.log('[HANDLER] No fixes needed to apply');
    global.handlerPatchesApplied = true;
  }
  
  // Load response cache for optimized command execution
  if (!global.responseCache) {
    try {
      global.responseCache = require('./lib/response-cache.js');
      console.log('[HANDLER] ✅ Response cache system loaded successfully');
    } catch (e) {
      console.error('[HANDLER] ⚠️ Failed to load response cache:', e.message);
      global.responseCache = null;
    }
  }
  
  // Load group optimization system
  if (!global.groupOptimization) {
    try {
      global.groupOptimization = require('./lib/group-optimization.js');
      console.log('[HANDLER] ✅ Group chat optimization system loaded successfully');
    } catch (e) {
      console.error('[HANDLER] ⚠️ Failed to load group optimization:', e.message);
      global.groupOptimization = null;
    }
  }
} catch (error) {
  console.error('[HANDLER] Error in initialization:', error);
}
// ================================================
const simple = require('./lib/simple')
const util = require('util')
const events = require('events')
const { getMessage } = require('./lib/languages')

// Increase EventEmitter max listeners to prevent memory leak warnings
events.EventEmitter.defaultMaxListeners = 200; // Increased from 150 to 200 to handle all event listeners

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

// Set up process signal handlers for graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[PROCESS] Received SIGTERM signal, initiating graceful shutdown');
    await performGracefulShutdown();
});

process.on('SIGINT', async () => {
    console.log('[PROCESS] Received SIGINT signal, initiating graceful shutdown');
    await performGracefulShutdown();
});

// Handle graceful shutdown messages from parent process
if (process.send) {
    process.on('message', async (message) => {
        if (message === 'GRACEFUL_SHUTDOWN') {
            console.log('[PROCESS] Received graceful shutdown message from parent');
            await performGracefulShutdown();
        }
    });
}

/**
 * Perform graceful shutdown, saving data and closing connections
 */
async function performGracefulShutdown() {
    console.log('[SHUTDOWN] Starting graceful shutdown sequence');
    
    try {
        // Set global shutdown flag
        global.isShuttingDown = true;
        
        // Save database
        if (global.db && global.db.data) {
            console.log('[SHUTDOWN] Saving database');
            await global.db.write();
            console.log('[SHUTDOWN] Database saved successfully');
        }
        
        // Save credentials if possible
        if (global.conn && global.conn.authState) {
            console.log('[SHUTDOWN] Saving credentials');
            if (typeof global.conn.authState.saveCreds === 'function') {
                await global.conn.authState.saveCreds();
                console.log('[SHUTDOWN] Credentials saved successfully');
            }
        }
        
        // Close connection
        if (global.conn && global.conn.ws) {
            console.log('[SHUTDOWN] Closing WebSocket connection');
            if (global.conn.ws.readyState !== 3) { // Not CLOSED
                global.conn.ws.close();
            }
        }
        
        // Notify parent process of completed shutdown
        if (process.send) {
            console.log('[SHUTDOWN] Notifying parent process of completed shutdown');
            try {
                process.send('SHUTDOWN_COMPLETE');
                // Allow time for the message to be sent
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error('[SHUTDOWN] Error sending shutdown complete notification:', err);
            }
        }
        
        // Exit after a short delay to allow operations to complete
        console.log('[SHUTDOWN] Graceful shutdown completed');
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    } catch (err) {
        console.error('[SHUTDOWN] Error during graceful shutdown:', err);
        process.exit(1);
    }
}

module.exports = {
    async handler(chatUpdate) {
        // Process parallel group messages if applicable
        if (global.groupOptimization && 
            chatUpdate && chatUpdate.messages && 
            chatUpdate.messages.length > 1 && 
            !chatUpdate._PARALLEL_PROCESSED) {
                
            // Check if any of the messages are from a group
            const hasGroupMessages = chatUpdate.messages.some(msg => {
                return msg.key && msg.key.remoteJid && msg.key.remoteJid.endsWith('@g.us');
            });
            
            if (hasGroupMessages) {
                // Use group optimization to process multiple messages in parallel
                try {
                    const processed = await global.groupOptimization.handleGroupMessages(
                        chatUpdate.messages.map(m => simple.smsg(this, m)).filter(Boolean),
                        m => this._handleSingleMessage(m, chatUpdate)
                    );
                    
                    if (processed) {
                        return; // Processing was handled by the optimization
                    }
                } catch (err) {
                    console.error('[HANDLER] Error in group optimization:', err);
                    // Continue with normal processing if optimization fails
                }
            }
        }
        
        // Early ciphertext and undefined message handling
        if (chatUpdate && chatUpdate.messages && chatUpdate.messages.length > 0) {
            let m = chatUpdate.messages[chatUpdate.messages.length - 1];
            if (m && m.messageStubType === 'CIPHERTEXT') {
                // Skip duplicate ciphertext messages
                if (global.ciphertextHandler && typeof global.ciphertextHandler.processCiphertextMessage === 'function') {
                    if (!global.ciphertextHandler.processCiphertextMessage(m)) {
                        return; // Skip processing this duplicate ciphertext
                    }
                } else if (global.processedCiphertext) {
                    // Fallback if handler not available
                    const id = m.key?.id || '';
                    const signature = `${id}:CIPHERTEXT`;
                    
                    // Check for duplicates
                    if (global.processedCiphertext.has(signature)) {
                        return; // Skip duplicate
                    }
                    
                    // Mark as processed
                    global.processedCiphertext.set(signature, Date.now());
                }
            }
        }

        if (global.db.data == null) await loadDatabase()
        this.msgqueque = this.msgqueque || []
        // console.log(chatUpdate)
        if (!chatUpdate) return
        // if (chatUpdate.messages.length > 2 || !chatUpdate.messages.length) return
        if (chatUpdate.messages.length > 1) console.log(chatUpdate.messages)
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        //console.log(JSON.stringify(m, null, 4))
        try {
            m = simple.smsg(this, m) || m
            if (!m) return
            // console.log(m)
            m.exp = 0
            m.limit = false
            try {
                let user = global.db.data.users[m.sender]
                if (typeof user !== 'object') global.db.data.users[m.sender] = {}
                if (user) {
                    // Language setting for users
                    if (!('language' in user)) user.language = global.language || 'de' // Default language from config
                    
                    if (!isNumber(user.balance)) user.balance = 0
                    if (!isNumber(user.expenses)) user.expenses = 0
                    if (!isNumber(user.healt)) user.healt = 100
                    if (!isNumber(user.health)) user.health = 100
                    if (!isNumber(user.energy)) user.energy = 100
                    if (!isNumber(user.power)) user.power = 100
                    if (!isNumber(user.title)) user.title = 0
                    if (!isNumber(user.stamina)) user.stamina = 100
                    if (!isNumber(user.thirst)) user.thirst = 100
                    if (!isNumber(user.hunger)) user.hunger = 100
                    if (!isNumber(user.level)) user.level = 0
                    if (!('titlein' in user)) user.titlein = 'None'
                    if (!("birthday" in user)) user.birthday = ''
                    if (!('partner' in user)) user.partner = ''
                    if (!('bestfriend' in user)) user.bestfriend = ''
                    if (!('location' in user)) user.location = 'Hut'
                    if (!('husbu' in user)) user.husbu = 'Not Set'
                    if (!('waifu' in user)) user.waifu = 'Not Set'
                    if (!isNumber(user.follow)) user.follow = 0
                    if (!isNumber(user.lastfollow)) user.lastfollow = 0
                    if (!isNumber(user.followers)) user.followers = 0
                    if (!isNumber(user.exp)) user.exp = 0
                    if (!isNumber(user.pc)) user.pc = 0
                    if (!isNumber(user.korbanngocok)) user.korbanngocok = 0
                    if (!isNumber(user.ojekk)) user.ojekk = 0
                    if (!isNumber(user.police)) user.police = 0
                    if (!isNumber(user.ojek)) user.ojek = 0
                    if (!isNumber(user.merchant)) user.merchant = 0
                    if (!isNumber(user.doctor)) user.doctor = 0
                    if (!isNumber(user.farmer)) user.farmer = 0
                    if (!isNumber(user.mechanic)) user.mechanic = 0
                    if (!isNumber(user.laborer)) user.laborer = 0
                    if (!isNumber(user.trofi)) user.trofi= 0
                    if (!user.rtrofi) user.rtrofi = 'Bronze'
                    if (!isNumber(user.troopcamp)) user.troopcamp = 0
                    if (!isNumber(user.coin)) user.coin = 0
                    if (!isNumber(user.atm)) user.atm = 0
                    if (!isNumber(user.limit)) user.limit = 10
                    if (!isNumber(user.glimit)) user.glimit = 10
                    if (!isNumber(user.tprem)) user.tprem = 0
                    if (!isNumber(user.tigame)) user.tigame = 5
                    if (!isNumber(user.lastclaim)) user.lastclaim = 0
                    if (isNumber(user.lastmulung)) user.lastmulung = 0
                    if (!isNumber(user.judilast)) user.judilast = 0
                    if (!isNumber(user.lastnambang)) user.lastnambang = 0
                    if (!isNumber(user.lastnebang)) user.lastnebang = 0
                    if (!isNumber(user.lastkerja)) user.lastkerja = 0
                    if (!isNumber(user.lastmaling)) user.lastmaling = 0
                    if (!isNumber(user.lastbunuhi)) user.lastbunuhi = 0
                    if (!isNumber(user.lastbisnis)) user.lastbisnis = 0
                    if (!isNumber(user.lastberbisnis)) user.lastberbisnis = 0
                    if (!isNumber(user.berbisnis)) user.berbisnis = 0
                    if (!isNumber(user.bisnis)) user.bisnis = 0
                    if (!isNumber(user.lastfishing)) user.lastfishing = 0
                    if (!isNumber(user.money)) user.money = 0
                    if (!isNumber(user.hospital)) user.hospital= 0
                    if (!isNumber(user.fortress)) user.fortress = 0
                    if (!isNumber(user.shield)) user.shield = false
                    if (!isNumber(user.farming)) user.farming = 0
                    if (!isNumber(user.mining_facility)) user.mining_facility = 0
                    if (!isNumber(user.camptroops)) user.camptroops = 0
                    if (!isNumber(user.mining)) user.mining = 0
                    
                    //Additional RPG items
                    if (!isNumber(user.litecoin)) user.litecoin = 0
                    if (!isNumber(user.chip)) user.chip = 0
                    if (!isNumber(user.tiketcoin)) user.tiketcoin = 0
                    if (!isNumber(user.points)) user.points = 0
                    if (!isNumber (user.lastbossbattle)) user.lastbossbattle = 0
                    if (!isNumber (user.bank)) user.bank = 0
                    if (!isNumber (user.balance)) user.balance = 0
                    
                    if (!isNumber(user.botol)) user.botol = 0
                    if (!isNumber(user.kardus)) user.kardus = 0
                    if (!isNumber(user.kaleng)) user.kaleng = 0
                    if (!isNumber(user.aqua)) user.aqua = 0
                    if (!isNumber(user.diamond)) user.diamond = 0
                    if (!isNumber(user.emerald)) user.emerald = 0
                    if (!isNumber(user.wood)) user.wood = 0
                    if (!isNumber(user.rock)) user.rock = 0
                    if (!isNumber(user.jewel)) user.jewel = 0
                    if (!isNumber(user.iron)) user.iron = 0
                    if (!isNumber(user.gold)) user.gold = 0
                    if (!isNumber(user.arlok)) user.arlok = 0
        
                    if (!isNumber(user.common)) user.common = 0
                    if (!isNumber(user.as)) user.as = 0
                    if (!isNumber(user.uncommon)) user.uncommon = 0
                    if (!isNumber(user.mythic)) user.mythic = 0
                    if (!isNumber(user.legendary)) user.legendary = 0
                    if (!isNumber(user.glory)) user.glory = 0
                    if (!isNumber(user.enchant)) user.enchant = 0
                    if (!isNumber(user.pet)) user.pet = 0
                    if (!isNumber(user.psepick)) user.psepick = 0
                    if (!isNumber(user.pweapons)) user.pweapons = 0
                    //rpg meracik
                    if (!isNumber(user.lastramuanclaim)) user.lastramuanclaim = 0
                    if (!isNumber(user.gems)) user.gems = 0
                    if (!isNumber(user.cupon)) user.cupon = 0
                    if (!isNumber(user.lastgemclaim)) user.lastgemclaim = 0
                    if (!isNumber(user.eleksirb)) user.eleksirb = 0
                    if (!isNumber(user.villagers)) user.villagers = 0
                    if (!isNumber(user.archer)) user.archer = 0
                    if (!isNumber(user.shadow)) user.shadow = 0
                    if (!isNumber(user.lastpotionclaim)) user.lastpotionclaim = 0
                    if (!isNumber(user.laststringclaim)) user.laststringclaim = 0
                    if (!isNumber(user.lastswordclaim)) user.lastswordclaim = 0
                    if (!isNumber(user.lastweaponclaim)) user.lastweaponclaim = 0
                    if (!isNumber(user.lastironclaim)) user.lastironclaim = 0
                    if (!isNumber(user.lastfishingclaim)) user.lastfishingclaim = 0
                    if (!isNumber(user.anakpancingan)) user.anakpancingan = 0
                
                    if (!isNumber(user.potion)) user.potion = 0
                    if (!isNumber(user.sampah)) user.sampah = 0
                    if (!isNumber(user.pancing)) user.pancing = 0
                    if (!isNumber(user.pancingan)) user.pancingan = 0
                    if (!isNumber(user.totalPancingan)) user.totalPancingan = 0
                    //stamina boosters
                    if (!isNumber(user.apel)) user.apel = 0
                    if (!isNumber(user.ayamb)) user.ayamb = 0
                    if (!isNumber(user.ayamg)) user.ayamg = 0
                    if (!isNumber(user.sapir)) user.sapir = 0
                    if (!isNumber(user.ssapi)) user.ssapi = 0
                    if (!isNumber(user.esteh)) user.esteh = 0
                    if (!isNumber(user.leleg)) user.leleg = 0
                    if (!isNumber(user.leleb)) user.leleb = 0
                    
                    if (!isNumber(user.ayambakar)) user.ayambakar = 0
                    if (!isNumber(user.gulai)) user.gulai = 0
                    if (!isNumber(user.rendang)) user.rendang = 0
                    if (!isNumber(user.ayamgoreng)) user.ayamgoreng = 0
                    if (!isNumber(user.oporayam)) user.oporayam = 0
                    if (!isNumber(user.steak)) user.steak = 0
                    if (!isNumber(user.babipanggang)) user.babipanggang = 0
                    if (!isNumber(user.ikanbakar)) user.ikanbakar = 0
                    if (!isNumber(user.nilabakar)) user.nilabakar = 0
                    if (!isNumber(user.lelebakar)) user.lelebakar = 0
                    if (!isNumber(user.bawalbakar)) user.bawalbakar = 0
                    if (!isNumber(user.udangbakar)) user.udangbakar = 0
                    if (!isNumber(user.pausbakar)) user.pausbakar = 0
                    if (!isNumber(user.kepitingbakar)) user.kepitingbakar = 0
                    if (!isNumber(user.soda)) user.soda = 0
                    if (!isNumber(user.vodka)) user.vodka = 0
                    if (!isNumber(user.ganja)) user.ganja = 0
                    if (!isNumber(user.bandage)) user.bandage = 0
                    if (!isNumber(user.sushi)) user.sushi = 0
                    if (!isNumber(user.roti)) user.roti = 0
                    //for cooking
                    if (!isNumber(user.coal)) user.coal = 0
                    if (!isNumber(user.lighter)) user.lighter = 0
                    //tools
                    if (!isNumber(user.umpan)) user.umpan = 0
                   
                    if (!isNumber(user.armor)) user.armor = 0
                    if (!isNumber(user.armordurability)) user.armordurability = 0
                    if (!isNumber(user.weapon)) user.weapon = 0
                    if (!isNumber(user.weapondurability)) user.weapondurability = 0
                    if (!isNumber(user.sword)) user.sword = 0
                    if (!isNumber(user.sworddurability)) user.sworddurability = 0
                    if (!isNumber(user.pickaxe)) user.pickaxe = 0
                    if (!isNumber(user.pickaxedurability)) user.pickaxedurability = 0
                    if (!isNumber(user.fishingrod)) user.fishingrod = 0
                    if (!isNumber(user.fishingroddurability)) user.fishingroddurability = 0
                    if (!isNumber(user.katana)) user.katana = 0
                    if (!isNumber(user.katanadurability)) user.katanadurability = 0
                    if (!isNumber(user.bow)) user.bow = 0
                    if (!isNumber(user.bowdurability)) user.bowdurability = 0
                    if (!isNumber(user.hatchet)) user.hatchet = 0
                    if (!isNumber(user.hatchetdurability)) user.hatchetdurability = 0
                    if (!isNumber(user.axe)) user.axe = 0
                    if (!isNumber(user.axedurability)) user.axedurability = 0
                    if (!isNumber(user.knife)) user.knife = 0
                    if (!isNumber(user.knifedurability)) user.knifedurability = 0
                    
                    if (!isNumber(user.kerjasatu)) user.kerjasatu = 0
                    if (!isNumber(user.kerjadua)) user.kerjadua = 0
                    if (!isNumber(user.kerjatiga)) user.kerjatiga = 0
                    if (!isNumber(user.kerjaempat)) user.kerjaempat = 0
                    if (!isNumber(user.kerjalima)) user.kerjalima = 0
                    if (!isNumber(user.kerjaenam)) user.kerjaenam = 0
                    if (!isNumber(user.kerjatujuh)) user.kerjatujuh = 0
                    if (!isNumber(user.kerjaeight)) user.kerjaeight = 0
                    if (!isNumber(user.kerjanine)) user.kerjanine = 0
                    if (!isNumber(user.kerjaten)) user.kerjaten = 0
                    if (!isNumber(user.kerjaeleven)) user.kerjaeleven = 0
                    if (!isNumber(user.kerjatwelve)) user.kerjatwelve = 0
                    if (!isNumber(user.kerjathirteen)) user.kerjathirteen = 0
                    if (!isNumber(user.kerjafourteen)) user.kerjafourteen = 0
                    if (!isNumber(user.kerjafifteen)) user.kerjafifteen = 0
                    
                    if (!isNumber(user.pekerjaansatu)) user.pekerjaansatu = 0
                    if (!isNumber(user.pekerjaandua)) user.pekerjaandua = 0
                    if (!isNumber(user.pekerjaantiga)) user.pekerjaantiga = 0
                    if (!isNumber(user.pekerjaanempat)) user.pekerjaanempat = 0
                    if (!isNumber(user.pekerjaanlima)) user.pekerjaanlima = 0
                    if (!isNumber(user.pekerjaanenam)) user.pekerjaanenam = 0
                    if (!isNumber(user.pekerjaantujuh)) user.pekerjaantujuh = 0
                    if (!isNumber(user.pekerjaaneight)) user.pekerjaaneight = 0
                    if (!isNumber(user.pekerjaannine)) user.pekerjaannine = 0
                    if (!isNumber(user.pekerjaanten)) user.pekerjaanten = 0
                    if (!isNumber(user.pekerjaaneleven)) user.pekerjaaneleven = 0
                    if (!isNumber(user.pekerjaantwelve)) user.pekerjaantwelve = 0
                    if (!isNumber(user.pekerjaanthirteen)) user.pekerjaanthirteen = 0
                    if (!isNumber(user.pekerjaanfourteen)) user.pekerjaanfourteen = 0
                    if (!isNumber(user.pekerjaanfifteen)) user.pekerjaanfifteen = 0
                    
                    if (!isNumber(user.kucing)) user.kucing = 0
                    if (!isNumber(user.kucinglastclaim)) user.kucinglastclaim = 0
                    if (!isNumber(user.kucingexp)) user.kucingexp = 0
                    if (!isNumber(user.kuda)) user.kuda = 0
                    if (!isNumber(user.kudalastclaim)) user.kudalastclaim = 0
                    if (!isNumber(user.rubah)) user.rubah = 0
                    if (!isNumber(user.rubahlastclaim)) user.rubahlastclaim = 0
                    if (!isNumber(user.rubahexp)) user.rubahexp = 0
                    if (!isNumber(user.anjing)) user.anjing = 0
                    if (!isNumber(user.anjinglastclaim)) user.anjinglastclaim = 0
                    if (!isNumber(user.anjingexp)) user.anjingexp = 0
                    if (!isNumber(user.serigalalastclaim)) user.serigalalastclaim = 0
                    if (!isNumber(user.nagalastclaim)) user.nagalastclaim = 0
                    if (!isNumber(user.phonixlastclaim)) user.phonixlastclaim = 0
                    if (!isNumber(user.phonixexp)) user.phonixexp = 0
                    if (!isNumber(user.griffinlastclaim)) user.griffinlastclaim = 0
                    if (!isNumber(user.centaurlastclaim)) user.centaurlastclaim = 0
                    
                    if (!isNumber(user.petFood)) user.petFood = 0
                    if (!isNumber(user.dragonFood)) user.dragonFood = 0
                    if (!isNumber(user.phoenixFood)) user.phoenixFood = 0
                    if (!isNumber(user.griffinFood)) user.griffinFood = 0
                    if (!isNumber(user.wolfFood)) user.wolfFood = 0
                    if (!isNumber(user.centaurFood)) user.centaurFood = 0
        
                    if (!'Banneduser' in user) user.Banneduser = false
                    if (!'BannedReason' in user) user.BannedReason = ''
                    if (!isNumber(user.warn)) user.warn = 0
                    if (!('banned' in user)) user.banned = false
                    if (!isNumber(user.bannedTime)) user.bannedTime = 0
        
                    if (!isNumber(user.afk)) user.afk = -1
                    if (!'afkReason' in user) user.afkReason = ''
                
                //PET
                    if (!isNumber(user.healthmonster)) user.healthmonster = 0
                    if (!isNumber(user.kittenCount)) user.kittenCount = 0
                    if (!isNumber(user.foalCount)) user.foalCount = 0
                    if (!isNumber(user.foxpupCount)) user.foxpupCount = 0
                    if (!isNumber(user.puppyCount)) user.puppyCount = 0
                    if (!isNumber(user.serigala)) user.serigala = 0
                    if (!isNumber(user.serigalaexp)) user.serigalaexp = 0
                    if (!isNumber(user.wolfpupCount)) user.wolfpupCount = 0
                    if (!isNumber(user.naga)) user.naga = 0
                    if (!isNumber(user.babydragonCount)) user.babydragonCount = 0
                    if (!isNumber(user.phonix)) user.phonix = 0
                    if (!isNumber(user.phoenixchickCount)) user.phoenixchickCount = 0
                    if (!isNumber(user.griffin)) user.griffin = 0
                    if (!isNumber(user.griffinchickCount)) user.griffinchickCount = 0
                    if (!isNumber(user.kyubi)) user.kyubi = 0
                    if (!isNumber(user.kyubikitCount)) user.kyubikitCount = 0
                    if (!isNumber(user.centaur)) user.centaur = 0
                    if (!isNumber(user.fightnaga)) user.fightnaga = 0
                    if (!isNumber(user.centaurfoalCount)) user.centaurfoalCount = 0
                    if (!isNumber(user.petFoodPremium)) user.petFoodPremium = 0
        
                    if (!isNumber(user.antispam)) user.antispam = 0
                    if (!isNumber(user.antispamlastclaim)) user.antispamlastclaim = 0
        
                    if (!isNumber(user.kayu)) user.kayu = 0
                    if (!('kingdom' in user)) user.kingdom = false
                    if (!isNumber(user.batu)) user.batu = 0
                    if (!isNumber(user.ramuan)) user.ramuan = 0
                    if (!isNumber(user.string)) user.string = 0
        
                    //fishing
                    if (!isNumber(user.paus)) user.paus = 0
             if (!isNumber(user.kepiting)) user.kepiting = 0
             if (!isNumber(user.gurita)) user.gurita = 0
             if (!isNumber(user.cumi)) user.cumi= 0
             if (!isNumber(user.buntal)) user.buntal = 0
             if (!isNumber(user.dory)) user.dory = 0
             if (!isNumber(user.lumba)) user.lumba = 0
             if (!isNumber(user.lobster)) user.lobster = 0
             if (!isNumber(user.hiu)) user.hiu = 0
             if (!isNumber(user.udang)) user.udang = 0
             if (!isNumber(user.ikan)) user.ikan = 0
             if (!isNumber(user.nila)) user.nila = 0
             if (!isNumber(user.bawal)) user.bawal = 0
             if (!isNumber(user.lele)) user.lele = 0
             if (!isNumber(user.orca)) user.orca = 0
                
             if (!isNumber(user.banteng)) user.banteng = 0
             if (!isNumber(user.harimau)) user.harimau = 0
             if (!isNumber(user.gajah)) user.gajah = 0
             if (!isNumber(user.kambing)) user.kambing = 0
             if (!isNumber(user.panda)) user.panda = 0
             if (!isNumber(user.buaya)) user.buaya = 0
             if (!isNumber(user.kerbau)) user.kerbau = 0
             if (!isNumber(user.sapi)) user.sapi = 0
             if (!isNumber(user.monyet)) user.monyet = 0
             if (!isNumber(user.babihutan)) user.babihutan = 0
             if (!isNumber(user.babi)) user.babi = 0
             if (!isNumber(user.ayam)) user.ayam = 0
         
                    if (!isNumber(user.lastadventure)) user.lastadventure = 0
                    if (!isNumber(user.lasthunting)) user.lasthunting = 0
                    if (!isNumber(user.lastkill)) user.lastkill = 0
                    if (!isNumber(user.lastfishing)) user.lastfishing = 0
                    if (!isNumber(user.lastdungeon)) user.lastdungeon = 0
                    if (!isNumber(user.lastwar)) user.lastwar = 0
                    if (!isNumber(user.lastsda)) user.lastsda = 0
                    if (!isNumber(user.lastberbru)) user.lastberbru = 0
                    if (!isNumber(user.lastduel)) user.lastduel = 0
                    if (!isNumber(user.lastjb)) user.lastjb = 0
                    if (!isNumber(user.lastSetstatus)) user.lastSetstatus = 0
                    if (!isNumber(user.lastmining)) user.lastmining = 0
                    if (!isNumber(user.lasthunt)) user.lasthunt = 0
                    if (!isNumber(user.lasthun)) user.lasthun = 0
                    if (!isNumber(user.lastngocok)) user.lastngocok = 0
                    if (!isNumber(user.lastgift)) user.lastgift = 0
                    if (!isNumber(user.lastrob)) user.lastrob = 0
                    if (!isNumber(user.lastngojek)) user.lastngojek = 0
                    
                    if (!isNumber(user.lastngewe)) user.lastngewe = 0
                    if (!isNumber(user.intimate)) user.intimate = 0
                    if (!isNumber(user.jualan)) user.jualan = 0
                    if (!isNumber(user.lastjualan)) user.lastjualan = 0
                    if (!isNumber(user.ngocokk)) user.ngocokk = 0
                    if (!isNumber(user.lastngocokk)) user.lastngocokk = 0
                    if (!isNumber(user.lastgrab)) user.lastgrab = 0
                    if (!isNumber(user.lastgardening)) user.lastgardening = 0
                    if (!isNumber(user.lastcodereg)) user.lastcodereg = 0
                    if (!isNumber(user.lasttrading)) user.lasttrading = 0
                    if (!isNumber(user.lasthourly)) user.lasthourly = 0
                    if (!isNumber(user.lastweekly)) user.lastweekly = 0
                    if (!isNumber(user.lastyearly)) user.lastyearly = 0
                    if (!isNumber(user.lastmonthly)) user.lastmonthly = 0
                    if (!isNumber(user.lastIstigfar)) user.lastIstigfar = 0
                    if (!isNumber(user.lastturu)) user.lastturu = 0
                    if (!isNumber(user.lastseen)) user.lastseen = 0
                    if (!isNumber(user.lastassistance)) user.lastassistance = 0
                    if (!isNumber(user.lastrobbery)) user.lastrobbery = 0
                    if (!('registered' in user)) user.registered = false
                    if (!user.registered) {
                    if (!('name' in user)) user.name = this.getName(m.sender)
        
                    if (!isNumber(user.apple)) user.apple = 0
                    if (!isNumber(user.grape)) user.grape = 0
                    if (!isNumber(user.orange)) user.orange = 0
                    if (!isNumber(user.watermelon)) user.watermelon = 0
                    if (!isNumber(user.mango)) user.mango = 0
                    if (!isNumber(user.strawberry)) user.strawberry = 0
                    if (!isNumber(user.banana)) user.banana = 0
                    if (!isNumber(user.kayu)) user.kayu = 0
                    if (!isNumber(user.food)) user.food = 0
                    if (!isNumber(user.grapeSeed)) user.grapeSeed = 0
                    if (!isNumber(user.bananaSeed)) user.bananaSeed = 0
                    if (!isNumber(user.appleSeed)) user.appleSeed = 0
                    if (!isNumber(user.mangoSeed)) user.mangoSeed = 0
                    if (!isNumber(user.orangeSeed)) user.orangeSeed = 0
                   
                    //word chain game
                    if (!isNumber(user.skata)) user.skata = 0
        
                      
                        if (!isNumber(user.age)) user.age = -1
                        if (!isNumber(user.premiumDate)) user.premiumDate = -1
                        if (!isNumber(user.regTime)) user.regTime = -1
                        
        }
                    if (!isNumber(user.level)) user.level = 0
                    if (!user.job) user.job = 'Unemployed'
                    if (!isNumber(user.jobexp)) user.jobexp = 0
                    if (!('jail' in user)) user.jail = false
                    if (!('jail' in user)) user.jail = false
                    if (!('dirawat' in user)) user.dirawat = false
                    if (!isNumber(user.antarpaket)) user.antarpaket = 0
                    if (!user.lbars) user.lbars = '[▒▒▒▒▒▒▒▒▒]'
                    if (!user.premium) user.premium = false
                    if (!user.premiumTime) user.premiumTime= 0
                    if (!user.vip) user.vip = 'no'
                    if (!isNumber(user.vipPoin)) user.vipPoin = 0
                    if (!user.role) user.role = 'Newbie ㋡'
                    if (!('autolevelup' in user)) user.autolevelup = true
                    if (!('lastIstigfar' in user)) user.lastIstigfar = true
                  
                    //demon slayer dan rpg new
                    if (!("skill" in user)) user.skill = ""
                    if (!("korps" in user)) user.korps = ""
                    if (!("korpsgrade" in user)) user.korpsgrade = ""
                    if (!("breaths" in user)) user.breaths = ""
                    if (!("magic" in user)) user.magic = ""
                    if (!("demon" in user)) user.demon = ""
                    if (!("job" in user)) user.job = "Not Have"  
                    if (!isNumber(user.darahiblis)) user.darahiblis = 0
                    if (!isNumber(user.lastyoutuber)) user.lastyoutuber = 0
                    if (!isNumber(user.subscribers)) user.subscribers = 0
                    if (!isNumber(user.viewers)) user.viewers = 0
                    if (!isNumber(user.like)) user.like = 0
                    if (!isNumber(user.playButton)) user.playButton = 0
                    if (!isNumber(user.demonblood)) user.demonblood = 0
                    if (!isNumber(user.demonkill)) user.demonkill = 0
                    if (!isNumber(user.hashirakill)) user.hashirakill = 0
                    if (!isNumber(user.alldemonkill)) user.alldemonkill = 0
                    if (!isNumber(user.allhashirakill)) user.allhashirakill = 0
                    if (!isNumber(user.attack)) user.attack = 0
                    if (!isNumber(user.strenght)) user.strenght = 0
                    if (!isNumber(user.speed)) user.speed = 0
                    if (!isNumber(user.defense)) user.defense = 0
                    if (!isNumber(user.regeneration)) user.regeneration = 0                    
                    if (!isNumber(user.dana)) user.dana = 0
                    if (!isNumber(user.gopay)) user.gopay = 0
                    if (!isNumber(user.ovo)) user.ovo = 0
                    if (!isNumber(user.laststudy)) user.laststudy = 0
                    if (!isNumber(user.lastescort)) user.lastescort = 0
                    if (!isNumber(user.lastcowboy)) user.lastcowboy = 0
                    if (!isNumber(user.lastdate)) user.lastdate = 0
                    if (!isNumber(user.lastmining)) user.lastmining = 0
                    if (!isNumber(user.lastshamanrite)) user.lastshamanrite = 0
                    if (!isNumber(user.lasttaxi)) user.lasttaxi = 0
                    if (!isNumber(user.taxi)) user.taxi = 0
                    if (!isNumber(user.lastjobkerja)) user.lastjobkerja = 0
                    if (!isNumber(user.lastjobchange)) user.lastjobchange = 0  
                } else global.db.data.users[m.sender] = {
                    lastjobkerja: 0,
                    lastjobchange: 0,
                    taxi: 0,
                    lasttaxi: 0,
                    lastyoutuber: 0,
                    subscribers: 0,
                    viewers: 0,
                    like: 0,
                    playButton: 0,
                    balance: 0,
                    pengeluaran: 0,
                    healt: 100,
                    health: 100,
                    energy: 100,
                    power: 100,
                    title: '',
                    thirst: 100,
                    laper: 100,
                    tprem: 0,
                    stamina : 100,
                    level: 0,
                    follow: 0,
                    lastfollow: 0,
                    followers: 0,
                    partner: '',
                    bestfriend: '', 
                    location: 'Hut', 
                    titlein: 'Not Available Yet',
                    birthday: '', 
                    waifu: 'Not Set Yet', 
                    husbu: 'Not Set Yet',
                    pc : 0,
                    exp: 0,
                    coin: 0,
                    atm: 0,
                    limit: 10,
                    skata: 0,
                    tigame: 999,
                    lastclaim: 0,
                    judilast: 0,
                    lastnambang: 0,
                    lastnebang: 0,
                    lastmulung: 0,
                    lastkerja: 0,
                    lastmaling: 0,
                    lastbunuhi: 0,
                    lastbisnis: 0,
                    lastberbisnis: 0,
                    bisnis: 0,
                    berbisnis: 0,
                    lastfishing: 0,
                    pancing: 0,
                    pancingan: 0,
                    totalPancingan: 0,
                    kardus: 0,
                    botol: 0,
                    kaleng: 0,
                    money: 0,
                    litecoin: 0,
                    chip: 0,
                    tiketcoin: 0,
                    points: 0,
                    bank: 0,
                    balance: 0,
                    diamond: 0,
                    emerald: 0,
                    rock: 0,
                    wood: 0,
                    iron: 0,
                    gold: 0,
                    common: 0,
                    uncommon: 0,
                    mythic: 0,
                    legendary: 0,
                    hospital: 0,
                    mining: 0,
                    camptroops: 0,
                    farming: 0,
                    fortress: 0,
                    trofi: 0,
                    rtrofi: 'bronze',
                    food: 0,
                    troopcamp: 0,
                    shield: 0,
                    arlok: 0,
                    ojekk: 0,
                    ojek: 0,
                    lastngewe: 0,
                    intimate: 0,
                    police: 0,
                    merchant: 0,
                    doctor: 0,
                    farmer: 0,
                    mechanic: 0,
                    laborer: 0,
                    korbanngocok: 0,
                    //+ stamina boosters
                    coal: 0,
                    lighter: 0,
                    ayambakar: 0,
                    gulai: 0,
                    rendang: 0,
                    ayamgoreng: 0,
                    oporayam: 0,
                    steak: 0,
                    babipanggang: 0,
                    ikanbakar: 0,
                    lelebakar: 0,
                    nilabakar: 0,
                    bawalbakar: 0,
                    udangbakar: 0,
                    pausbakar: 0,
                    kepitingbakar: 0,
                    soda: 0,
                    vodka: 0,
                    ganja: 0,
                    bandage: 0,
                    sushi: 0,
                    roti: 0,
                    //crafting potions
                    ramuan: 0,
                    lastramuanclaim: 0,
                    gems: 0,
                    cupon: 0,
                    lastgemsclaim: 0,
                    eleksirb: 0,
                    villagers: 0,
                    archer: 0,
                    shadow: 0,
                    laststringclaim: 0,
                    lastpotionclaim: 0,
                    lastswordclaim: 0,
                    lastweaponclaim: 0,
                    lastironclaim: 0,
                    lastfishingclaim: 0,
                    fishingbait: 0,
                    //fishing
             as: 0,
            paus: 0,
            kepiting: 0,
            gurita: 0,
            cumi: 0,
            buntal: 0,
            dory: 0,
            lumba: 0,
            lobster: 0,
            hiu: 0,
            lele: 0,
            nila: 0,
            bawal: 0,
            udang: 0,
            ikan: 0,
            orca: 0,
            banteng: 0,
            harimau: 0,
            gajah: 0,
            kambing: 0,
            panda: 0,
            buaya: 0,
            kerbau : 0,
            sapi: 0,
            monyet : 0,
            babihutan: 0,
            babi: 0,
            ayam: 0,
            apple: 20,
            ayamb: 0,
            ayamg: 0,
            ssapi: 0,
            sapir: 0,
            leleb: 0,
            leleg: 0,
            esteh: 0,
                    pet: 0,
                    potion: 0,
                    sampah: 0,
                    kucing: 0,
                    kucinglastclaim: 0,
                    kucingexp: 0,
                    kuda: 0,
                    kudalastclaim: 0,
                    rubah: 0,
                    rubahlastclaim: 0,
                    rubahexp: 0,
                    anjing: 0,
                    anjinglastclaim: 0,
                    anjingexp: 0,
                    naga: 0,
                    nagalastclaim: 0,
                    griffin: 0,
                    griffinlastclaim: 0,
                    centaur: 0,
                    fightnaga: 0,
                    centaurlastclaim: 0,
                    serigala: 0,
                    serigalalastclaim: 0,
                    serigalaexp: 0,
                    phonix: 0,
                    phonixlastclaim: 0,
                    phonixexp : 0,
                    dragonFood: 0,
                    phoenixFood: 0,
                    centaurFood: 0,
                    wolfFood: 0,
                    
                    Banneduser: false,
                    BannedReason: '',
                    banned: false, 
                    bannedTime: 0,
                    warn: 0,
                    afk: -1,
                    afkReason: '',
                    kittenCount: 0,
                    foalCount: 0,
                    foxpupCount: 0,
                    puppyCount: 0,
                    petFood: 0,
                    petFoodPremium: 0,
                    antispam: 0,
                    antispamlastclaim: 0,
                    kayu: 0,
                    batu: 0,
                    string: 0,
                    umpan: 0,
                    armor: 0,
                    armordurability: 0,
                    weapon: 0,
                    weapondurability: 0,
                    sword: 0,
                    sworddurability: 0,
                    pickaxe: 0,
                    pickaxedurability: 0,
                    fishingrod: 0,
                    fishingroddurability: 0,
                    katana: 0,
                    katanadurability: 0,
                    bow: 0,
                    bowdurability: 0,
                    hatchet: 0,
                    hatchetdurability: 0,
                    axe: 0,
                    axedurability: 0,
                    knife: 0,
                    knifedurability: 0,                  
                    kerjasatu: 0,
                    kerjadua: 0,
                    kerjatiga: 0,
                    kerjaempat: 0,
                    kerjalima: 0,
                    kerjaenam: 0,
                    kerjatujuh: 0,
                    kerjaeight: 0,
                    kerjanine: 0,
                    kerjaten: 0,
                    kerjaeleven: 0,
                    kerjatwelve: 0,
                    kerjathirteen: 0,
                    kerjafourteen: 0,
                    kerjafifteen: 0,    
                    pekerjaansatu: 0,
                    pekerjaandua: 0,
                    pekerjaantiga: 0,
                    pekerjaanempat: 0,
                    pekerjaanlima: 0,
                    pekerjaanenam: 0,
                    pekerjaantujuh: 0,
                    pekerjaaneight: 0,
                    pekerjaannine: 0,
                    pekerjaanten: 0,
                    pekerjaaneleven: 0,
                    pekerjaantwelve: 0,
                    pekerjaanthirteen: 0,
                    pekerjaanfourteen: 0,
                    pekerjaanfifteen: 0,                    
                    lastadventure: 0,
                    lastwar: 0,
                    lastgardening: 0,
                    lasthunting: 0,
                    lastassistance: 0,
                    lastrobbery: 0,
                    lastkill: 0,
                    lastfishing: 0,
                    lastdungeon: 0,
                    lastduel: 0,
                    lastmining: 0,
                    lasthourly: 0,
                    lasttrading: 0,
                    lasthunt: 0,
                    lasthun : 0,
                    lastweekly: 0,
                    lastmonthly: 0,
                    lastyearly: 0,
                    lastjb: 0,
                    lastrob: 0,
                    lastdaang: 0,
                    lastngojek: 0,
                    lastgrab: 0,
                    lastngocok: 0,
                    lastturu: 0,
                    lastseen: 0,
                    lastSetstatus: 0,
                    registered: false,
                    apple: 20,
                    mango: 0,
                    strawberry: 0,
                    watermelon: 0,
                    orange: 0,
                    name: this.getName(m.sender),
                    age: -1,
                    regTime: -1,
                    premiumDate: -1, 
                    premium: false,
                    premiumTime: 0,
                    vip: 'no', 
                    vipPoin: 0,
                    job: 'Unemployed', 
                    jobexp: 0,
                    jail: false, 
                    jail: false, 
                    antarpaket: 0,
                    dirawat: false, 
                    lbars: '[▒▒▒▒▒▒▒▒▒]', 
                    role: 'Newbie ㋡', 
                    registered: false,
                    name: this.getName(m.sender),
                    age: -1,
                    regTime: -1,
                    autolevelup: true,
                    lastIstigfar: 0,
                    
                    skill: "",
                    korps: "",
                    korpsgrade: "",
                    demon: "",
                    breaths: "",
                    magic: "",
                    darahiblis: 0,
                    demonblood: 0,
                    demonkill: 0,
                    hashirakill: 0,
                    alldemonkill: 0,
                    allhashirakill: 0,
                    attack: 0,
                    speed: 0,
                    strenght: 0,
                    defense: 0,
                    regeneration: 0,
                    ovo: 0,
                    dana: 0,
                    gopay: 0,
                    laststudy: 0,
                    lastescort: 0,
                    lastcowboy: 0,
                    lastdate: 0,
                    lastmining: 0,
                    lastshamanrite: 0,
                }
             let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
            if (chat) {
                // Language setting for groups
                if (!('language' in chat)) chat.language = global.language || 'de' // Default language from config
                
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat)) chat.welcome = true
                if (!isNumber(chat.welcometype)) chat.welcometype = 1
                if (!('detect' in chat)) chat.detect = false
                if (!('isBannedTime' in chat)) chat.isBannedTime = false
                if (!('mute' in chat)) chat.mute = false
                if (!('listStr' in chat)) chat.listStr = {}
                if (!('sWelcome' in chat)) chat.sWelcome = '*Welcome @user!*\n\n     To the group @subject\n\n╭─────「 *intro* 」\n│\n│─⪼ Name : \n│─⪼ Age :\n│─⪼ Location :\n│─⪼ Gender :\n╰─────────────\n\n> hope you enjoy your stay'
                if (!('sBye' in chat)) chat.sBye = 'Goodbye @user'
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('delete' in chat)) chat.delete = true
                if (!('antiLink' in chat)) chat.antiLink = true
                if (!('antiLinknokick' in chat)) chat.antiLinknokick = false
                if (!('antiSticker' in chat)) chat.antiSticker = false
                if (!('antiStickernokick' in chat)) chat.antiStickernokick = false
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('antiporn' in chat)) chat.antiporn = false
                if (!('antiToxic' in chat)) chat.antiToxic = false
                if (!isNumber(chat.expired)) chat.expired = 0
                if (!("memgc" in chat)) chat.memgc = {}
                if (!('antilinkig' in chat)) chat.antilinkig = false
                if (!('antilinkignokick' in chat)) chat.antilinkignokick = false
                if (!('antilinkfb' in chat)) chat.antilinkfb = false
                if (!('antilinkfbnokick' in chat)) chat.antilinkfbnokick = false
                if (!('antilinktwit' in chat)) chat.antilinktwit = false
                if (!('antilinktwitnokick' in chat)) chat.antilinktwitnokick = false
                if (!('antilinkyt' in chat)) chat.antilinkyt = false
                if (!('antilinkytnokick' in chat)) chat.antilinkytnokick = false
                if (!('antilinktele' in chat)) chat.antilinktele = false
                if (!('antilinktelenokick' in chat)) chat.antilinktelenokick = false
                if (!('antilinkwame' in chat)) chat.antilinkwame = false
                if (!('antilinkwamenokick' in chat)) chat.antilinkwamenokick = false
                if (!('antilinkall' in chat)) chat.antilinkall = false
                if (!('antilinkallnokick' in chat)) chat.antilinkallnokick = false
                if (!('antilinktt' in chat)) chat.antilinktt = false
                if (!('antilinkttnokick' in chat)) chat.antilinkttnokick = false
                if (!('antibot' in chat)) chat.antibot = false
                if (!('autohd' in chat)) chat.autohd = false
                if (!('autobio' in chat)) chat.autobio = false
                if (!('rpg' in chat)) chat.rpg = false
                if (!('autobackup' in chat)) chat.autobackup = false
                if (!('autodl' in chat)) chat.autodl = true 
                if (!('notifyearthquake' in chat)) chat.notifyearthquake = false
                if (!('notifyweather' in chat)) chat.notifyweather = false
                if (!('notifyprayer' in chat)) chat.notifyprayer = false
                if (!('autotranslate' in chat)) chat.autotranslate = false
                if (!('memgc' in chat)) chat.memgc = {}
            } else global.db.data.chats[m.chat] = {
                language: global.language || 'de', // Default language from config
                autotranslate: false,
                notifyprayer: false,
                notifyearthquake: false,
                notifyweather: false,    
                autodl: true,
                autobackup: false,
                autobio: false,
                autohd: false,
                antiporn: false,
                isBanned: false,
                welcome: false,
                welcometype: 1,
                detect: false,
                isBannedTime: false,
                mute: false,
                listStr: {},
                memgc: {}, // Initialize memgc as an empty object
                sWelcome: '*Welcome @user!*\n\n     To the group @subject\n\n╭─────「 *intro* 」\n│\n│─⪼ Name : \n│─⪼ Age :\n│─⪼ Location :\n│─⪼ Gender :\n╰─────────────\n\n> hope you enjoy your stay',
                sBye: 'Goodbye @user',
                sPromote: '',
                sDemote: '',
                delete: false, 
                antiLink: false,
                antiLinknokick: false,
                antiSticker: false, 
                antiStickernokick: false, 
                viewonce: false,
                antiToxic: false,
                antilinkig: false, 
                antilinkignokick: false, 
                antilinkyt: false, 
                antilinkytnokick: false, 
                antilinktwit: false, 
                antilinktwitnokick: false, 
                antilinkfb: false, 
                antilinkfbnokick: false, 
                antilinkall: false, 
                antilinkallnokick: false, 
                antilinkwame: false,
                antilinkwamenokick: false, 
                antilinktele: false, 
                antilinktelenokick: false, 
                antilinktt: false, 
                antilinkttnokick: false, 
                antibot: false, 
                rpg: false, 
            }
            let memgc = global.db.data.chats[m.chat].memgc[m.sender]
            if (typeof memgc !== 'object') global.db.data.chats[m.chat].memgc[m.sender] = {}
            if (memgc) {
                if (!('blacklist' in memgc)) memgc.blacklist = false
                if (!('banned' in memgc)) memgc.banned = false
                if (!isNumber(memgc.bannedTime)) memgc.bannedTime = 0
                if (!isNumber(memgc.chat)) memgc.chat = 0
                if (!isNumber(memgc.chatTotal)) memgc.chatTotal = 0
                if (!isNumber(memgc.command)) memgc.command = 0
                if (!isNumber(memgc.commandTotal)) memgc.commandTotal = 0
                if (!isNumber(memgc.lastseen)) memgc.lastseen = 0
            } else global.db.data.chats[m.chat].memgc[m.sender] = {
                blacklist: false,
                banned: false,
                bannedTime: 0,
                chat: 0,
                chatTotal: 0,
                command: 0,
                commandTotal: 0,
                lastseen: 0
            }
        } catch (e) {
            console.error(e)
        }
            if (opts['nyimak']) return
            if (!m.fromMe && opts['self']) return
            if (opts['pconly'] && m.chat.endsWith('g.us')) return
            if (opts['gconly'] && !m.chat.endsWith('g.us')) return
            if (opts['swonly'] && m.chat !== 'status@broadcast') return
            if (typeof m.text !== 'string') m.text = ''
            if (opts['queque'] && m.text) {
                this.msgqueque.push(m.id || m.key.id)
                // Use a much smaller delay that scales with queue, with a maximum cap
                await delay(Math.min(this.msgqueque.length * 100, 500))
            }
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!plugin.all) continue
                if (typeof plugin.all !== 'function') continue
                try {
                    await plugin.all.call(this, m, chatUpdate)
                } catch (e) {
                    if (typeof e === 'string') continue
                    console.error(e)
                    
                    // Get user's preferred language
                    const user = global.db.data.users[m.sender];
                    const chat = global.db.data.chats[m.chat];
                    const lang = global.language || user?.language || chat?.language || 'de';
                    
                    // Send error message in user's language
                    m.reply(getMessage('error', lang));
                }
            }
            if (m.id.startsWith('3EB0') || (m.id.startsWith('BAE5') && m.id.length === 16 || m.isBaileys && m.fromMe)) return;
            m.exp += Math.ceil(Math.random() * 10)

            let usedPrefix
            let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

            // CRITICAL SECURITY ENHANCEMENT: Stronger permission checks with strict comparison and validation
            // Real Owner check - uses exact string comparison for safety with extra validation
            // Clean up owner numbers to ensure styourdized format
            // Initialize owner numbers array
            let ownerNumbers = [];
            
            // SECURITY FIX: Bot number is no longer autodeadcally an owner
            // Only config.js defined owners get owner status
            
            // Add global owners with extensive validation
            if (Array.isArray(global.owner)) {
                console.log(`[SECURITY] Loading ${global.owner.length} owners from config`);
                global.owner.forEach((owner, index) => {
                    if (typeof owner === 'string' && owner.trim() !== '') {
                        // Styourdize format: strip non-numbers and ensure @s.whatsapp.net suffix
                        let cleanNumber = owner.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                        
                        // Don't add duplicates
                        if (!ownerNumbers.includes(cleanNumber)) {
                            ownerNumbers.push(cleanNumber);
                            console.log(`[SECURITY] Added owner ${index+1}: ${cleanNumber}`);
                        }
                    } else {
                        console.log(`[SECURITY] Normalizing owner format for index ${index}`);
                        // Try to extract the number from comma-separated format
                        if (typeof owner === 'string' && owner.includes(',')) {
                            const parts = owner.split(',');
                            if (parts.length > 0) {
                                const cleanNumber = parts[0].trim().replace(/[^0-9]/g, '');
                                if (cleanNumber && !ownerNumbers.includes(cleanNumber)) {
                                    ownerNumbers.push(cleanNumber);
                                    console.log(`[SECURITY] Extracted and added owner from string: ${cleanNumber}`);
                                }
                            }
                        }
                    }
                });
            } else {
                console.log(`[SECURITY WARNING] No owners defined in config.js or invalid format`);
            }
            
            // CRITICAL SECURITY FIX: Only use the numbers from config.js as real owners
            // The original config.js owners get the real owner status, nobody else
            // Use explicit check against config.js owners, not derived ownerNumbers
            const configOwners = Array.isArray(global.owner) ? global.owner.map(o => {
                if (typeof o === 'string') {
                    return o.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                }
                return null;
            }).filter(Boolean) : [];
            
            // Strict equality check for real owner validation - CRITICAL SECURITY CHECK
            // This is the primary security gate to protect owner-only commands
            let isROwner = configOwners.some(v => v === m.sender)
            
            // Defensive default - no ownership unless explicitly granted by exact match
            let isOwner = false
            
            // SECURITY FIX: Only grant owner status to owners in the whitelist from config.js
            if (isROwner) {
              isOwner = true
              console.log(`[SECURITY] Owner privileges granted to ${m.sender} (Real Owner from config.js)`)
            }
            
            // SECURITY FIX: The bot's own self-messages are no longer autodeadcally granted owner privileges
            // This is critical to prevent unauthorized access through the bot's own messages
            // Only configOwners get owner privileges, regardless of message source
            // We leave the check for logging purposes but don't grant privileges
            if (m.fromMe && m.sender === this.user.jid) {
              // Do not grant isOwner unless the bot number is explicitly listed in config.js owners
              if (configOwners.includes(this.user.jid)) {
                isOwner = true
                console.log(`[SECURITY] Owner privileges granted to bot self-message (also in config.js): ${m.sender}`)
              } else {
                console.log(`[SECURITY] Bot self-message not granted owner privileges - not in config.js: ${m.sender}`)
              }
            }
            
            // CRITICAL: We completely eliminate m.fromMe as a factor for non-matching senders
            // Prevent fromMe spoofing by checking that sender is in configOwners
            if (m.fromMe && !isROwner && m.sender !== this.user.jid) {
              // Log potential security breach attempts
              console.log(`[SECURITY ALERT] Blocked non-owner fromMe message from: ${m.sender}`)
              // Owner privilege remains false
            }
            
            // Log for auditing
            console.log(`[SECURITY DEBUG] ownerNumbers: ${JSON.stringify(ownerNumbers)}`)
            console.log(`[SECURITY DEBUG] sender: ${m.sender}, fromMe: ${m.fromMe}, isROwner: ${isROwner}`)
            console.log(`[SECURITY RESULT] isOwner granted: ${isOwner}`)
            
            // Moderators - enhanced security with strict comparison
            let modNumbers = global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            let isMods = isOwner || modNumbers.some(v => v === m.sender)
            
            // Premium users check
            let isPrems = isROwner || (db.data.users[m.sender]?.premiumTime > 0 || db.data.users[m.sender]?.premium)
            
            // Group metadata with active fetching when missing
            let groupMetadata = {}
            let participants = []
            
            if (m.isGroup) {
                try {
                    // First try to get metadata from cache
                    groupMetadata = ((conn.chats[m.chat] || {}).metadata || {})
                    
                    // If participants is missing or empty, actively fetch it
                    if (!groupMetadata.participants || groupMetadata.participants.length === 0) {
                        console.log(`[METADATA] No participants found for ${m.chat}, fetching fresh metadata...`)
                        try {
                            // Actively fetch group metadata
                            groupMetadata = await conn.groupMetadata(m.chat)
                            // Update cache for future use
                            if (conn.chats[m.chat]) {
                                conn.chats[m.chat].metadata = groupMetadata
                            }
                            console.log(`[METADATA] Successfully fetched group metadata for ${m.chat}`)
                        } catch (e) {
                            console.error(`[METADATA ERROR] Failed to fetch group metadata: ${e.message}`)
                        }
                    }
                    
                    // Use whatever participants we have now
                    participants = groupMetadata.participants || []
                    
                    if (participants.length === 0) {
                        console.log(`[WARNING] No participants found for group ${m.chat} even after fetch attempt`)
                    } else {
                        console.log(`[METADATA] Group ${m.chat} has ${participants.length} participants`)
                    }
                } catch (e) {
                    console.error(`[METADATA ERROR] ${e.message}`)
                }
            }
            
            // User data with enhanced identity validation
            let user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {}
            
            // Bot data with enhanced identity validation
            let bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === this.user.jid) : {}) || {}
            
            // Explicit admin status check with fallback
            let isAdmin = user && (user.admin === 'admin' || user.admin === 'superadmin') || false
            let isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin') || false
            
            // Log admin status for debugging and enforce security checks
            if (m.isGroup) {
                console.log(`[ADMIN CHECK] Chat: ${m.chat}, User ${m.sender} is admin: ${isAdmin}, Bot is admin: ${isBotAdmin}`)
                
                // Enhanced: Double-verify admin status from groupMetadata for BOTH user and bot
                if (groupMetadata && groupMetadata.participants) {
                    try {
                        // Get admin list directly from metadata with precise ID format
                        const adminList = groupMetadata.participants
                            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                            .map(p => conn.decodeJid(p.id)) // Ensure consistent ID format

                        // Verify if user is in admin list - use exact ID comparison
                        const userJid = conn.decodeJid(m.sender)
                        const botJid = conn.decodeJid(this.user.jid)
                        
                        // Precise admin verification for both user and bot
                        const userIsReallyAdmin = adminList.some(id => id === userJid)
                        const botIsReallyAdmin = adminList.some(id => id === botJid)
                        
                        // If there's a mismatch for user admin status, correct it
                        if (isAdmin !== userIsReallyAdmin) {
                            console.log(`[SECURITY WARNING] User admin status mismatch for ${m.sender} in ${m.chat}. Correcting from ${isAdmin} to ${userIsReallyAdmin}`)
                            isAdmin = userIsReallyAdmin
                        }
                        
                        // If there's a mismatch for bot admin status, correct it - THIS IS KEY
                        if (isBotAdmin !== botIsReallyAdmin) {
                            console.log(`[SECURITY WARNING] Bot admin status mismatch in ${m.chat}. Correcting from ${isBotAdmin} to ${botIsReallyAdmin}`)
                            isBotAdmin = botIsReallyAdmin
                        }
                        
                        // Debug trace
                        console.log(`[ADMIN DEBUG] Bot JID: ${botJid}`)
                        console.log(`[ADMIN DEBUG] Admin list: ${JSON.stringify(adminList)}`)
                        console.log(`[ADMIN DEBUG] Final status - Bot is admin: ${isBotAdmin}, User is admin: ${isAdmin}`)
                        
                    } catch (e) {
                        console.error(`[ADMIN VERIFY ERROR] ${e.message}`)
                    }
                }
            }
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!opts['restrict']) if (plugin.tags && plugin.tags.includes('admin')) {
                    // global.dfail('restrict', m, this)
                    continue
                }
                const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
                let match = (_prefix instanceof RegExp ? // RegExp Mode?
                    [[_prefix.exec(m.text), _prefix]] :
                    Array.isArray(_prefix) ? // Array?
                        _prefix.map(p => {
                            let re = p instanceof RegExp ? // RegExp in Array?
                                p :
                                new RegExp(str2Regex(p))
                            return [re.exec(m.text), re]
                        }) :
                        typeof _prefix === 'string' ? // String?
                            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                            [[[], new RegExp]]
                ).find(p => p[1])
                if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                })) continue
                if (typeof plugin !== 'function') continue
                if ((usedPrefix = (match[0] || '')[0])) {
                    // FIXED COMMAND PARSING: Better handling of commands with parameters
                    let noPrefix = m.text.replace(usedPrefix, '')
                    let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                    args = args || []
                    let _args = noPrefix.trim().split` `.slice(1)
                    let text = _args.join` `
                    
                    // Original command for basic matching
                    command = (command || '').toLowerCase()
                    
                    // Full text for regex pattern matching (CRITICAL for commands with parameters)
                    // This ensures RegExp patterns can match both the command and its parameters
                    const fullCommand = noPrefix.trim().toLowerCase()
                    
                    // Debug log for command parsing
                    if (command.startsWith('nsfw') || command.startsWith('togglensfw')) {
                        console.log(`[COMMAND DEBUG] Full command: ${fullCommand}`);
                        console.log(`[COMMAND DEBUG] Command part: ${command}`);
                        console.log(`[COMMAND DEBUG] Args: ${JSON.stringify(args)}`);
                        console.log(`[COMMAND DEBUG] Text: ${text}`);
                    }
                    
                    let fail = plugin.fail || global.dfail // When failed
                    
                    // IMPROVED: Enhanced command matching with full command text support
                    let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
                        // Try matching the full command string first for regex patterns that include parameters
                        plugin.command.test(fullCommand) || plugin.command.test(command) :
                        Array.isArray(plugin.command) ? // Array?
                            plugin.command.some(cmd => {
                                if (cmd instanceof RegExp) { // RegExp in Array?
                                    // Try full command first, then just the command part
                                    return cmd.test(fullCommand) || cmd.test(command);
                                }
                                return cmd === command;
                            }) :
                            typeof plugin.command === 'string' ? // String?
                                plugin.command === command :
                                false

                    if (!isAccept) continue
                    m.plugin = name
                    if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                        let chat = global.db.data.chats[m.chat]
                        let user = global.db.data.users[m.sender]
                        if (name != 'group-modebot.js' && name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && (chat?.isBanned || chat?.mute))
                        return
                        if (name != 'unbanchat.js' && chat && chat.isBanned) return // Except this
                        if (name != 'unbanuser.js' && user && user.banned) return
                        if (m.isGroup) {
                            chat.memgc[m.sender].command++
                            chat.memgc[m.sender].commandTotal++
                            chat.memgc[m.sender].lastCmd = Date.now()
                        }
                        user.command++
                        user.commandTotal++
                        user.lastCmd = Date.now()
                    }
                    if (plugin.rpg && !global.db.data.chats[m.chat].rpg) { // rpg
                        fail('rpg', m, this) 
                        continue
                    }
                    // CRITICAL SECURITY CHANGES - Triple-layered protection for owner commands
                    
                    // SECURITY FIX level 1: Check bot auth - Requires user to be on the owner whitelist for owner-only commands
                    if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
                        console.log(`[SECURITY] Restricted command "${command}" denied to non-owner: ${m.sender}`)
                        fail('owner', m, this)
                        continue
                    }
                    
                    // SECURITY FIX level 2: Real Owner - Most restrictive check, requires exact match with ownerNumbers
                    if (plugin.rowner && !isROwner) { // Real Owner check strengthened
                        console.log(`[SECURITY] Real owner command "${command}" denied to non-owner: ${m.sender}`)
                        fail('rowner', m, this)
                        continue
                    }
                    
                    // SECURITY FIX level 3: Owner check - Now uses exact equality with properly formatted phone numbers
                    if (plugin.owner && !isOwner) { // Number Owner check improved
                        console.log(`[SECURITY] Owner command "${command}" denied to non-owner: ${m.sender}`)
                        fail('owner', m, this)
                        continue
                    }
                    
                    // Add comprehensive logging for each owner command access attempt
                    if ((plugin.rowner || plugin.owner) && (isROwner || isOwner)) {
                        console.log(`[SECURITY PASS] Owner command "${command}" executed by authorized user: ${m.sender}`)
                    }
                    if (plugin.mods && !isMods) { // Moderator
                        fail('mods', m, this)
                        continue
                    }
                    if (plugin.premium && !isPrems) { // Premium
                        fail('premium', m, this)
                        continue
                    }
                    if (plugin.group && !m.isGroup) { // Group Only
                        fail('group', m, this)
                        continue
                    } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
                        // Extra verification for bot admin check - double check with the group metadata again
                        let reallyBotAdmin = false
                        if (m.isGroup) {
                            try {
                                if (groupMetadata && groupMetadata.participants) {
                                    const adminList = groupMetadata.participants
                                        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                                        .map(p => conn.decodeJid(p.id))
                                    reallyBotAdmin = adminList.some(id => id === conn.decodeJid(this.user.jid))
                                    
                                    // Only use this as a last-resort override if metadata shows bot IS admin
                                    if (reallyBotAdmin) {
                                        console.log(`[ADMIN OVERRIDE] Bot was incorrectly marked as non-admin in ${m.chat}, correcting based on metadata.`)
                                        isBotAdmin = true // Override isBotAdmin if metadata shows it is admin
                                    }
                                }
                            } catch (e) {
                                console.error(`[ADMIN VERIFY ERROR at botAdmin check] ${e.message}`)
                            }
                        }
                        
                        // Only fail after double-checking
                        if (!isBotAdmin) {
                            console.log(`[SECURITY] Command requiring bot admin "${command}" used in chat where bot is not admin: ${m.chat}`)
                            fail('botAdmin', m, this)
                            continue
                        }
                    } else if (plugin.admin && !isAdmin) { // User Admin
                        console.log(`[SECURITY] Admin command "${command}" attempted by non-admin: ${m.sender} in chat: ${m.chat}`)
                        fail('admin', m, this)
                        continue
                    }
                    if (plugin.private && m.isGroup) { // Private Chat Only
                        fail('private', m, this)
                        continue
                    }
                    if (plugin.register == true && _user.registered == false) { // Butuh List?
                        fail('unreg', m, this)
                        continue
                    }
                    m.isCommand = true
                    // Get user's language settings
                    const userLang = global.db.data.users[m.sender]?.language || global.language;
                    
                    // XP handling with translation support
                    let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 // XP Earning per command
                    if (xp > 200) m.reply(getMessage('cheat_detected', userLang)) // Cheating detection with translation
                    else m.exp += xp
                    
                    // Limit check with translation support
                    if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                        this.reply(m.chat, getMessage('limit_exhausted', userLang, {
                            prefix: usedPrefix
                        }), m)
                        continue // Limit exhausted
                    }
                    
                    // level requirement check with translation support
                    if (plugin.level > _user.level) {
                        this.reply(m.chat, getMessage('level_required', userLang, {
                            required: plugin.level,
                            current: _user.level,
                            prefix: usedPrefix
                        }), m)
                        continue // If the level has not been reached
                    }
                    let extra = {
                        match,
                        usedPrefix,
                        noPrefix,
                        _args,
                        args,
                        command,
                        text,
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                    }                          
                    try {
                        await plugin.call(this, m, extra)
                        if (!isPrems) m.limit = m.limit || plugin.limit || false
                    } catch (e) {
                        // Error occured
                        m.error = e
                        console.error(e)
                        if (e) {
                            let text = util.format(e)
                            for (let key of Object.values(APIKeys))
                                text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                            if (e.name)
                            for (let jid of owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != this.user.jid)) {
                                let data = (await this.onWhatsApp(jid))[0] || {}
                                if (data.exists)
                                    m.reply(`*Plugin:* ${m.plugin}\n*Sender:* @${m.sender.split`@`[0]}\n*Chat:* ${m.chat}\n*Chat Name:* ${await this.getName(m.chat)}\n*Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\``.trim(), data.jid, { mentions: [m.sender] })
                            }
                            m.reply(text)
                        }
                    } finally {
                        // m.reply(util.format(_user))
                        if (typeof plugin.after === 'function') {
                            try {
                                await plugin.after.call(this, m, extra)
                            } catch (e) {
                                console.error(e)
                            }
                        }
                        if (m.limit) m.reply(getMessage('limit_used', userLang, { count: m.limit }))
                   }
                    break
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
             //conn.sendPresenceUpdate('composing', m.chat) // kalo pengen auto vn delete // di baris dekat conn
            //console.log(global.db.data.users[m.sender])
            let user, stats = global.db.data.stats
            if (m) {
                if (m.sender && (user = global.db.data.users[m.sender])) {
                    user.exp += m.exp
                    user.limit -= m.limit * 1
                }

                let stat
                if (m.plugin) {
                    let now = + new Date
                    if (m.plugin in stats) {
                        stat = stats[m.plugin]
                        if (!isNumber(stat.total)) stat.total = 1
                        if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                        if (!isNumber(stat.last)) stat.last = now
                        if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                    } else stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                    stat.total += 1
                    stat.last = now
                    if (m.error == null) {
                        stat.success += 1
                        stat.lastSuccess = now
                    }
                }
            }

            // Handle special CIPHERTEXT messages to prevent undefined logging
            if (m.mtype === 'ciphertext') {
                // Skip normal print for CIPHERTEXT messages
                console.log('[CIPHERTEXT] Received ciphertext message, skipping print');
            } else {
                try {
                    require('./lib/print')(m, this)
                } catch (e) {
                    // Only log basic error information to prevent TypeError
                    console.error(`[PRINT ERROR] ${e.message || 'Unknown print error'}`)
                }
            }
            
            // Prevent 'undefined' text from being logged directly after print function
            // This fixes the TypeError issue and duplicate logs
            if (opts['autoread']) await this.readMessages([m.key])
                let chat = global.db.data.chats[m.chat]

        user.chat++
        user.chatTotal++
        user.lastseen = Date.now()

        if (m.isGroup) {
            chat.memgc[m.sender].chat++
            chat.memgc[m.sender].chatTotal++
            chat.memgc[m.sender].lastseen = Date.now()
        }
        }
    },
   async participantsUpdate({ id, participants, action }) {
        if (opts['self']) return
        // if (id in conn.chats) return // First login will spam
        if (global.isInit) return
        let chat = db.data.chats[id] || {}
        
        // Critical: Update metadata cache whenever participants change
        try {
            console.log(`[ADMIN UPDATE] Participant update in group ${id}, action: ${action}`)
            // Always refresh group metadata on participant changes (especially admin changes)
            const freshMetadata = await this.groupMetadata(id)
            
            // Update the metadata cache
            if (this.chats[id]) {
                this.chats[id].metadata = freshMetadata
                console.log(`[ADMIN UPDATE] Refreshed metadata cache for group ${id}`)
                
                // Check if bot is admin after the update
                const botJid = this.decodeJid(this.user.jid)
                const adminList = freshMetadata.participants
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => this.decodeJid(p.id))
                    
                const botIsAdmin = adminList.some(admin => admin === botJid)
                console.log(`[ADMIN UPDATE] Bot admin status in ${id}: ${botIsAdmin}, Admin list: ${JSON.stringify(adminList)}`)
                
                // Check if the bot was just added to a group
                if (action === 'add' && participants.includes(botJid)) {
                    console.log(`[OWNER ADD] Bot was added to group ${id}, attempting to add owner...`)
                    
                    try {
                        // Extract owner numbers from global.owner which could be in different formats
                        let ownerNumbers = []
                        
                        if (Array.isArray(global.owner)) {
                            // Handle different possible formats of global.owner
                            global.owner.forEach(entry => {
                                console.log(`[OWNER ADD] Processing owner entry: ${JSON.stringify(entry)}`)
                                if (typeof entry === 'string') {
                                    // Format: ['491234567890']
                                    ownerNumbers.push(entry)
                                    console.log(`[OWNER ADD] Added string owner: ${entry}`)
                                } else if (Array.isArray(entry) && entry.length > 0 && typeof entry[0] === 'string') {
                                    // Format: [['491234567890', 'Owner Name', true]]
                                    ownerNumbers.push(entry[0])
                                    console.log(`[OWNER ADD] Added array owner: ${entry[0]}`)
                                }
                            })
                        }
                        
                        // Also check global.numberowner if available
                        if (typeof global.numberowner === 'string' && global.numberowner) {
                            if (!ownerNumbers.includes(global.numberowner)) {
                                ownerNumbers.push(global.numberowner)
                            }
                        }
                            
                        if (ownerNumbers && ownerNumbers.length > 0) {
                            console.log(`[OWNER ADD] Found ${ownerNumbers.length} owners in config: ${JSON.stringify(ownerNumbers)}`)
                            
                            // Check if owners are already in the group
                            const groupParticipants = freshMetadata.participants.map(p => this.decodeJid(p.id))
                            const ownersToAdd = []
                            
                            for (const owner of ownerNumbers) {
                                // Normalize owner number format
                                let ownerJid = owner
                                if (!ownerJid.includes('@')) {
                                    ownerJid = `${owner}@s.whatsapp.net`
                                }
                                
                                // Make sure there are no duplicate '@' symbols
                                ownerJid = ownerJid.replace(/(@s\.whatsapp\.net)+$/g, '@s.whatsapp.net')
                                
                                if (!groupParticipants.includes(ownerJid)) {
                                    ownersToAdd.push(ownerJid)
                                } else {
                                    console.log(`[OWNER ADD] Owner ${ownerJid} is already in the group`)
                                }
                            }
                            
                            // Add owners who aren't already in the group
                            if (ownersToAdd.length > 0 && botIsAdmin) {
                                console.log(`[OWNER ADD] Adding owners to group: ${JSON.stringify(ownersToAdd)}`)
                                await this.groupParticipantsUpdate(id, ownersToAdd, 'add')
                                console.log(`[OWNER ADD] Successfully added owners to group ${id}`)
                                
                                // Send a notification message to the group about owner being added
                                const { getMessage } = require('./lib/languages')
                                const chatLang = chat.language || global.language
                                const message = getMessage('owner_added', chatLang, { owner: global.nameowner || 'Owner' })
                                
                                try {
                                    await this.sendMessage(id, { text: message })
                                } catch (notifyError) {
                                    console.error(`[OWNER ADD] Error sending notification: ${notifyError.message}`)
                                }
                            } else {
                                console.log(`[OWNER ADD] No owners to add or bot is not admin. Bot admin: ${botIsAdmin}`)
                            }
                        } else {
                            console.log(`[OWNER ADD] No valid owner numbers found in config`)
                        }
                    } catch (ownerError) {
                        console.error(`[OWNER ADD] Error adding owner to group: ${ownerError.message}`)
                    }
                }
            }
        } catch (e) {
            console.error(`[ADMIN UPDATE ERROR] Failed to refresh metadata: ${e.message}`)
        }
        let text = ''
        switch (action) {
        case 'add':
        case 'remove':
                case 'leave':
                case 'invite':
                case 'invite_v4':
                if (chat.welcome) {
                    let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
                    for (let user of participants) {
                        let pp = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9mFzSckd12spppS8gAJ2KB2ER-ccZd4pBbw&usqp=CAU'
                        try {
                             pp = await this.profilePictureUrl(user, 'image')
                        } catch (e) {
                        } finally {
                            // Use language-specific welcome/goodbye messages
                            const { getMessage } = require('./lib/languages')
                            const chatLang = chat.language || global.language
                            
                            text = (action === 'add' ? 
                                // For new members, use custom message or language-specific welcome
                                (chat.sWelcome || 
                                 this.welcome || 
                                 conn.welcome || 
                                 getMessage('welcome_message', chatLang))
                                .replace('@subject', await this.getName(id))
                                .replace('@desc', groupMetadata.desc ? groupMetadata.desc.toString() : '') :
                                
                                // For departing members, use custom message or language-specific goodbye
                                (chat.sBye || 
                                 this.bye || 
                                 conn.bye || 
                                 getMessage('goodbye_message', chatLang)))
                                .replace('@user', '@' + user.split('@')[0])
                            this.sendMessage(id, {
                            text: text,
                            contextInfo: {
                            mentionedJid: [user],
                            externalAdReply: {  
                            title: action === 'add' ? getMessage('welcome', chatLang) : getMessage('goodbye', chatLang),
                            body: global.wm,
                            thumbnailUrl: pp,
                            sourceUrl: 'https://fire.betabotz.eu.org',
                            mediaType: 1,
                            renderLargerThumbnail: true 
                            }}}, { quoted: null})
                        }
                    }
                }
                break                        
            case 'promote':
                // Use translated promotion message or custom message
                const { getMessage } = require('./lib/languages');
                const chatLangPromote = chat.language || global.language;
                const userName = participants[0].split('@')[0];
                
                text = (chat.sPromote || 
                        this.spromote || 
                        conn.spromote || 
                        getMessage('promote_success', chatLangPromote, { user: userName }))
                        .replace('@user', '@' + userName);
                
                if (chat.detect) this.sendMessage(id, text, {
                    contextInfo: {
                        mentionedJid: this.parseMention(text)
                    }
                });
                break;
                
            case 'demote':
                // Use translated demotion message or custom message
                const chatLangDemote = chat.language || global.language;
                const demoteUserName = participants[0].split('@')[0];
                
                text = (chat.sDemote || 
                        this.sdemote || 
                        conn.sdemote || 
                        getMessage('demote_success', chatLangDemote, { user: demoteUserName }))
                        .replace('@user', '@' + demoteUserName);
                
                if (chat.detect) this.sendMessage(id, text, {
                    contextInfo: {
                        mentionedJid: this.parseMention(text)
                    }
                })
                break
        }
    },
    async delete({ remoteJid, fromMe, id, participant }) {
        if (fromMe) return
        let chats = Object.entries(conn.chats).find(([user, data]) => data.messages && data.messages[id])
        if (!chats) return
        let msg = JSON.parse(chats[1].messages[id])
        let chat = global.db.data.chats[msg.key.remoteJid] || {}
        if (chat.delete) return
        
        // Get chat language and translation function
        const chatLang = chat?.language || global.language;
        const { getMessage } = require('./lib/languages');

        await this.reply(msg.key.remoteJid, `
${getMessage('message_deleted_notice', chatLang, { user: participant.split`@`[0] })}
${getMessage('disable_delete_notice', chatLang)}
`.trim(), msg, {
            mentions: [participant]
        })
        this.copyNForward(msg.key.remoteJid, msg).catch(e => console.log(e, msg))
    }
}

global.dfail = (Type, m, conn) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = global.language || user?.language || chat?.language || 'de';
    
    // Import the getMessage function
    const { getMessage } = require('./lib/languages');
    
    // Define permission error messages with translation keys
    let errorTypes = {
        rowner: getMessage('rowner_only', lang),
        owner: getMessage('owner_only', lang),
        mods: getMessage('mods_only', lang),
        premium: getMessage('premium_only', lang),
        rpg: getMessage('rpg_disabled', lang, { prefix: global.prefix }),
        group: getMessage('group_only', lang),
        private: getMessage('private_only', lang),
        admin: getMessage('admin_only', lang),
        botAdmin: getMessage('bot_admin_required', lang),
        unreg: getMessage('unreg', lang, { prefix: global.prefix }),
        restrict: getMessage('restricted_feature', lang)
    };
    
    let msg = errorTypes[Type]
    if (msg) {
        // Log attempts to use restricted commands
        console.log(`[PERMISSION DENIED] Type: ${Type}, Command: ${m.text}, User: ${m.sender}`)
        return m.reply(msg)
    }
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)

// Process message handler for graceful shutdown
if (process.send) {
    process.on('message', async (message) => {
        console.log(chalk.cyan('[PROCESS] Received message from parent:'), message);
        
        if (message === 'GRACEFUL_SHUTDOWN') {
            console.log(chalk.yellow('[GRACEFUL-SHUTDOWN] Received shutdown signal, cleaning up...'));
            
            try {
                // 1. Save database state
                if (global.db && global.db.data) {
                    console.log(chalk.blue('[GRACEFUL-SHUTDOWN] Saving database...'));
                    await global.db.write();
                    console.log(chalk.green('[GRACEFUL-SHUTDOWN] Database saved successfully'));
                }
                
                // 2. Close WhatsApp connection properly
                if (global.conn) {
                    console.log(chalk.blue('[GRACEFUL-SHUTDOWN] Closing WhatsApp connection...'));
                    
                    // Save credentials first
                    if (global.conn.authState && global.conn.authState.creds) {
                        try {
                            await global.conn.authState.saveCreds();
                            console.log(chalk.green('[GRACEFUL-SHUTDOWN] Credentials saved successfully'));
                        } catch (err) {
                            console.error(chalk.red('[GRACEFUL-SHUTDOWN] Error saving credentials:'), err);
                        }
                    }
                    
                    // Close the WebSocket connection
                    if (global.conn.ws) {
                        try {
                            if (global.conn.ws.readyState !== 3) { // If not already closed
                                global.conn.ws.close();
                                console.log(chalk.green('[GRACEFUL-SHUTDOWN] WebSocket connection closed'));
                            }
                        } catch (err) {
                            console.error(chalk.red('[GRACEFUL-SHUTDOWN] Error closing WebSocket:'), err);
                        }
                    }
                    
                    // Remove all event listeners
                    try {
                        if (global.conn.ev) {
                            global.conn.ev.removeAllListeners();
                            console.log(chalk.green('[GRACEFUL-SHUTDOWN] Removed all event listeners'));
                        }
                    } catch (err) {
                        console.error(chalk.red('[GRACEFUL-SHUTDOWN] Error removing event listeners:'), err);
                    }
                }
                
                // 3. Clean up file watchers
                console.log(chalk.blue('[GRACEFUL-SHUTDOWN] Cleaning up file watchers...'));
                try {
                    // Unwatching handler.js
                    fs.unwatchFile(file);
                    
                    // Get a list of all watched files
                    const watchedFiles = fs.realpathSync.cache || {};
                    for (const filepath in watchedFiles) {
                        try {
                            fs.unwatchFile(filepath);
                        } catch (err) {
                            // Ignore errors on individual files
                        }
                    }
                } catch (err) {
                    console.error(chalk.red('[GRACEFUL-SHUTDOWN] Error cleaning up file watchers:'), err);
                }
                
                console.log(chalk.green('[GRACEFUL-SHUTDOWN] Cleanup completed, exiting gracefully...'));
                
                // Send a success message back to the parent process
                process.send('SHUTDOWN_COMPLETE');
                
                // Exit with success code after a small delay to allow message to be sent
                setTimeout(() => {
                    process.exit(0);
                }, 500);
                
            } catch (err) {
                console.error(chalk.red('[GRACEFUL-SHUTDOWN] Error during shutdown:'), err);
                
                // Exit anyway, but with an error code
                process.exit(1);
            }
        }
    });
}

// File watcher
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    delete require.cache[file]
    if (global.reloadHandler) console.log(global.reloadHandler())
})

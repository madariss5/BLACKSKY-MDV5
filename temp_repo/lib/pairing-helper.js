/**
 * BLACKSKY-MD Premium - WhatsApp Pairing Helper
 * 
 * This module provides enhanced connection and pairing support, helping to:
 * 1. Detect and recover from connection failures
 * 2. Manage QR code regeneration and pairing attempts
 * 3. Support multiple pairing methods (QR code, phone number link)
 * 4. Track session state and quality
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { delay } = require('./myfunc');

// Configuration
const PAIRING_CONFIG = {
  maxPairingAttempts: 10,
  qrRefreshInterval: 20000,
  sessionDir: path.join(process.cwd(), 'sessions'),
  debug: true,
  maxQRRefreshes: 5
};

// State tracking
const pairingState = {
  isPairing: false,
  pairingMethod: null, // 'qr' or 'phone'
  pairingAttempts: 0,
  qrRefreshes: 0,
  lastQRTimestamp: 0,
  qrDisplayed: false,
  sessionFilesExist: false,
  phoneNumberLink: null
};

/**
 * Log a pairing message with timestamp
 * @param {string} message 
 * @param {string} type 
 */
function pairingLog(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(chalk.blue(`[PAIRING][${type}][${timestamp}] ${message}`));
}

/**
 * Check if session files exist
 * @returns {boolean}
 */
function checkSessionFiles() {
  try {
    // Check if sessions directory exists
    if (!fs.existsSync(PAIRING_CONFIG.sessionDir)) {
      fs.mkdirSync(PAIRING_CONFIG.sessionDir, { recursive: true });
      pairingLog('Sessions directory created', 'INFO');
      return false;
    }
    
    // Look for critical session files
    const sessionFiles = fs.readdirSync(PAIRING_CONFIG.sessionDir)
      .filter(file => file.endsWith('.json') && !file.includes('backup'));
    
    pairingState.sessionFilesExist = sessionFiles.length > 0;
    return pairingState.sessionFilesExist;
  } catch (error) {
    pairingLog(`Error checking session files: ${error.message}`, 'ERROR');
    return false;
  }
}

/**
 * Handle QR code generation
 * @param {string} qr - QR code data
 */
function handleQRCode(qr) {
  if (!pairingState.isPairing || pairingState.pairingMethod !== 'qr') {
    return;
  }
  
  // Update state
  pairingState.qrRefreshes++;
  pairingState.lastQRTimestamp = Date.now();
  pairingState.qrDisplayed = true;

  // Generate and display QR code
  try {
    // Use baileys QR handler if available
    if (global.QR) {
      global.QR(qr);
    }
    
    // Display in console
    pairingLog(`QR Code generated (${pairingState.qrRefreshes}/${PAIRING_CONFIG.maxQRRefreshes})`, 'INFO');
    console.log(`\n\n🔄 Scan this QR code to connect (attempt ${pairingState.qrRefreshes}/${PAIRING_CONFIG.maxQRRefreshes}):\n`);
    
    // Different QR display options depending on environment
    if (global.process.platform !== 'win32') {
      const qrcode = require('qrcode-terminal');
      qrcode.generate(qr, { small: false });
    } else {
      // For Windows or other environments, output URL that contains the QR
      console.log(`\n🔗 QR Link: https://blackskymd-qr.herokuapp.com/qr?code=${encodeURIComponent(qr)}\n`);
    }
    
    pairingLog('Waiting for QR code to be scanned...', 'INFO');
  } catch (error) {
    pairingLog(`Error displaying QR code: ${error.message}`, 'ERROR');
  }
  
  // Check for max QR refreshes
  if (pairingState.qrRefreshes >= PAIRING_CONFIG.maxQRRefreshes) {
    pairingLog('Maximum QR code refresh attempts reached', 'WARN');
    
    // Try switching to phone number link method after max QR attempts
    if (!pairingState.phoneNumberLink) {
      switchToPairingMethod('phone');
    }
  }
}

/**
 * Switch to a different pairing method
 * @param {string} method - 'qr' or 'phone'
 */
function switchToPairingMethod(method) {
  if (method !== 'qr' && method !== 'phone') {
    pairingLog(`Invalid pairing method: ${method}`, 'ERROR');
    return;
  }
  
  pairingState.pairingMethod = method;
  pairingState.pairingAttempts++;
  
  if (method === 'qr') {
    pairingLog('Switching to QR code pairing method', 'INFO');
    pairingState.qrRefreshes = 0;
    pairingState.qrDisplayed = false;
  } else if (method === 'phone') {
    pairingLog('Switching to phone number link pairing method', 'INFO');
    generatePhoneNumberLink();
  }
}

/**
 * Generate a phone number link for pairing
 * This is an alternative to QR code when it doesn't work
 */
function generatePhoneNumberLink() {
  try {
    if (!global.conn) {
      pairingLog('Cannot generate phone number link: connection not initialized', 'ERROR');
      return;
    }
    
    if (typeof global.conn.generatePairingCode !== 'function') {
      pairingLog('Phone number pairing not supported in this version of Baileys', 'ERROR');
      return;
    }
    
    // Generate pairing code
    global.conn.generatePairingCode().then(code => {
      if (!code) {
        pairingLog('Failed to generate pairing code', 'ERROR');
        return;
      }
      
      pairingState.phoneNumberLink = code;
      
      // Display instructions
      console.log('\n');
      console.log(chalk.greenBright('╭───────────────────────────────────────╮'));
      console.log(chalk.greenBright('│         📱 PHONE NUMBER LOGIN         │'));
      console.log(chalk.greenBright('╰───────────────────────────────────────╯'));
      console.log('\n');
      console.log(chalk.cyanBright('1. Open WhatsApp on your phone'));
      console.log(chalk.cyanBright('2. Tap Menu or Settings'));
      console.log(chalk.cyanBright('3. Select Linked Devices'));
      console.log(chalk.cyanBright('4. Tap "Link a Device"'));
      console.log(chalk.cyanBright('5. Enter this code on your phone:'));
      console.log('\n');
      console.log(chalk.whiteBright.bgGreenBright(` ${code} `));
      console.log('\n');
      
      pairingLog(`Phone number pairing code generated: ${code}`, 'SUCCESS');
    }).catch(err => {
      pairingLog(`Error generating pairing code: ${err.message}`, 'ERROR');
    });
  } catch (error) {
    pairingLog(`Error in phone number pairing: ${error.message}`, 'ERROR');
  }
}

/**
 * Start the pairing process
 * @param {string} method - Initial pairing method ('qr' or 'phone')
 */
function startPairing(method = 'qr') {
  // Reset pairing state
  pairingState.isPairing = true;
  pairingState.pairingMethod = method;
  pairingState.pairingAttempts = 0;
  pairingState.qrRefreshes = 0;
  pairingState.lastQRTimestamp = 0;
  pairingState.qrDisplayed = false;
  
  // Check if session files exist
  const hasSession = checkSessionFiles();
  
  if (hasSession) {
    pairingLog('Existing session files found, trying to restore connection', 'INFO');
  } else {
    pairingLog('No session files found, starting new pairing process', 'INFO');
    switchToPairingMethod(method);
  }
}

/**
 * Handle connection open event
 */
function handleConnectionOpen() {
  pairingState.isPairing = false;
  pairingLog('WhatsApp connection established successfully!', 'SUCCESS');
  
  // Display information about the connection
  if (global.conn && global.conn.user) {
    const { name, id } = global.conn.user;
    pairingLog(`Connected as: ${name || 'Unknown'} (${id.split('@')[0]})`, 'INFO');
  }
  
  // Reset state
  pairingState.pairingAttempts = 0;
  pairingState.qrRefreshes = 0;
  pairingState.qrDisplayed = false;
}

/**
 * Handle connection close event
 */
function handleConnectionClose(reason) {
  if (!pairingState.isPairing) {
    pairingState.isPairing = true;
    pairingLog(`Connection closed: ${reason || 'Unknown reason'}`, 'WARN');
    
    // Try to reconnect with previous method
    const method = pairingState.pairingMethod || 'qr';
    switchToPairingMethod(method);
  }
}

// Export functions for use in other modules
module.exports = {
  startPairing,
  handleQRCode,
  handleConnectionOpen,
  handleConnectionClose,
  checkSessionFiles,
  switchToPairingMethod,
  generatePhoneNumberLink,
  pairingState,
  PAIRING_CONFIG
};
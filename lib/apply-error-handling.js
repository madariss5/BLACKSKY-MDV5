/**
 * Apply Error Handling Patch
 * 
 * This module applies the comprehensive error handling system to the bot.
 * It should be loaded early in the bot startup process to provide protection
 * against crashes and connection issues from the beginning.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Import error handling initialization
const initializeErrorHandling = require('./error-handling-init');

/**
 * Apply error handling to the bot
 * @param {Object} conn - Baileys connection instance
 * @param {Object} options - Configuration options
 * @returns {Object} Error handling interface
 */
function applyErrorHandling(conn, options = {}) {
  console.log(chalk.blue('🛡️ Applying comprehensive error handling patch...'));
  
  // Initialize error handling systems
  const errorHandling = initializeErrorHandling(conn, options);
  
  // Add custom WhatsApp error handling to connection functions
  patchBaileysConnection(conn, errorHandling);
  
  // Return the error handling interface
  return errorHandling;
}

/**
 * Patch Baileys connection methods with error handling
 * @param {Object} conn - Baileys connection instance
 * @param {Object} errorHandling - Error handling interface
 */
function patchBaileysConnection(conn, errorHandling) {
  // Skip if connection is not available
  if (!conn) {
    console.error(chalk.red('[ERROR-PATCH] No connection object provided, cannot patch'));
    return;
  }
  
  console.log(chalk.blue('[ERROR-PATCH] Patching Baileys connection methods with error handling...'));
  
  // Store original functions
  const originalFunctions = {
    sendMessage: conn.sendMessage,
    updateProfilePicture: conn.updateProfilePicture,
    groupMetadata: conn.groupMetadata,
    groupCreate: conn.groupCreate,
    groupLeave: conn.groupLeave,
    groupUpdateSubject: conn.groupUpdateSubject,
    groupParticipantsUpdate: conn.groupParticipantsUpdate,
    groupUpdateDescription: conn.groupUpdateDescription,
    groupInviteCode: conn.groupInviteCode
  };
  
  // ==== Patch message sending ====
  if (typeof conn.sendMessage === 'function') {
    conn.sendMessage = async function(jid, content, options = {}) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.sendMessage.call(this, jid, content, options),
        'sendMessage',
        { jid, contentType: content?.text ? 'text' : (content?.image ? 'image' : 'other') }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched sendMessage with error handling'));
  }
  
  // ==== Patch profile picture update ====
  if (typeof conn.updateProfilePicture === 'function') {
    conn.updateProfilePicture = async function(jid, content) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.updateProfilePicture.call(this, jid, content),
        'updateProfilePicture',
        { jid }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched updateProfilePicture with error handling'));
  }
  
  // ==== Patch group metadata fetching ====
  if (typeof conn.groupMetadata === 'function') {
    conn.groupMetadata = async function(jid) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupMetadata.call(this, jid),
        'groupMetadata',
        { jid }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupMetadata with error handling'));
  }
  
  // ==== Patch group creation ====
  if (typeof conn.groupCreate === 'function') {
    conn.groupCreate = async function(subject, participants) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupCreate.call(this, subject, participants),
        'groupCreate',
        { subject, participantCount: participants.length }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupCreate with error handling'));
  }
  
  // ==== Patch group leaving ====
  if (typeof conn.groupLeave === 'function') {
    conn.groupLeave = async function(jid) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupLeave.call(this, jid),
        'groupLeave',
        { jid }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupLeave with error handling'));
  }
  
  // ==== Patch group subject update ====
  if (typeof conn.groupUpdateSubject === 'function') {
    conn.groupUpdateSubject = async function(jid, subject) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupUpdateSubject.call(this, jid, subject),
        'groupUpdateSubject',
        { jid, subject }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupUpdateSubject with error handling'));
  }
  
  // ==== Patch group participants update ====
  if (typeof conn.groupParticipantsUpdate === 'function') {
    conn.groupParticipantsUpdate = async function(jid, participants, action) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupParticipantsUpdate.call(this, jid, participants, action),
        'groupParticipantsUpdate',
        { jid, action, participantCount: participants.length }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupParticipantsUpdate with error handling'));
  }
  
  // ==== Patch group description update ====
  if (typeof conn.groupUpdateDescription === 'function') {
    conn.groupUpdateDescription = async function(jid, description) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupUpdateDescription.call(this, jid, description),
        'groupUpdateDescription',
        { jid }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupUpdateDescription with error handling'));
  }
  
  // ==== Patch group invite code fetch ====
  if (typeof conn.groupInviteCode === 'function') {
    conn.groupInviteCode = async function(jid) {
      return errorHandling.withErrorHandling(
        () => originalFunctions.groupInviteCode.call(this, jid),
        'groupInviteCode',
        { jid }
      );
    };
    console.log(chalk.green('[ERROR-PATCH] ✓ Patched groupInviteCode with error handling'));
  }
  
  // Add connection manager and error handler to the connection object
  conn.errorHandling = errorHandling;
  conn.connectionManager = errorHandling.connectionManager;
  
  // Add convenience methods for reconnection and diagnostics
  conn.diagnose = errorHandling.diagnose;
  conn.recover = errorHandling.recover;
  
  console.log(chalk.green('[ERROR-PATCH] ✓ Added convenience methods for recovery and diagnostics'));
  console.log(chalk.green('[ERROR-PATCH] ✓ Baileys connection methods have been patched successfully'));
}

module.exports = applyErrorHandling;
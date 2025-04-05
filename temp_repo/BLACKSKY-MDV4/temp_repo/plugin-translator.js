/**
 * WhatsApp Bot Plugin Translator
 * 
 * This script helps translate hardcoded English strings in plugins to use
 * the language system. It analyzes plugin files, extracts English strings,
 * and replaces them with getMessage() calls with proper keys.
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const { getMessage, getAvailableLanguages } = require('./lib/languages');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Keep track of stats
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  stringsFound: 0,
  stringsReplaced: 0,
  alreadyTranslationEnabled: 0
};

/**
 * Check if a plugin already has language support
 * @param {string} content - File content
 * @returns {boolean} - Whether the plugin already uses the language system
 */
function hasLanguageSupport(content) {
  return content.includes("getMessage") && 
         (content.includes("../lib/languages") || content.includes("./lib/languages"));
}

/**
 * Add language support imports to a plugin
 * @param {string} content - File content
 * @returns {string} - Updated content with imports
 */
function addLanguageImports(content) {
  // Check if the file already has the required imports
  if (hasLanguageSupport(content)) {
    return content;
  }
  
  // Add the import at the top of the file
  const importStatement = `const { getMessage } = require('../lib/languages');\n\n`;
  
  // Find the right place to insert the import
  // Try to place it after other imports
  const lines = content.split('\n');
  let importAdded = false;
  let resultLines = [];
  
  // Check if there's a comment block at the top
  let inCommentBlock = false;
  let endOfCommentBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    resultLines.push(lines[i]);
    
    // Check for comment blocks
    if (lines[i].includes('/**')) {
      inCommentBlock = true;
    } else if (inCommentBlock && lines[i].includes('*/')) {
      endOfCommentBlock = true;
      inCommentBlock = false;
    } else if (endOfCommentBlock && !importAdded && 
              (lines[i].trim() === '' || i === lines.length - 1 || 
               (i < lines.length - 1 && !lines[i+1].startsWith('const') && !lines[i+1].startsWith('let') && !lines[i+1].startsWith('import')))) {
      resultLines.push(importStatement.trim());
      importAdded = true;
    } else if (!inCommentBlock && !importAdded && 
               (lines[i].startsWith('const') || lines[i].startsWith('let') || lines[i].startsWith('import')) &&
               (i === lines.length - 1 || 
                (i < lines.length - 1 && !lines[i+1].startsWith('const') && !lines[i+1].startsWith('let') && !lines[i+1].startsWith('import')))) {
      resultLines.push(importStatement.trim());
      importAdded = true;
    }
  }
  
  // If we couldn't find a good spot, just add it at the top
  if (!importAdded) {
    return importStatement + content;
  }
  
  return resultLines.join('\n');
}

/**
 * Extract strings that need translation from a plugin
 * @param {string} content - File content
 * @returns {string[]} - Array of strings to translate
 */
function extractStringsForTranslation(content) {
  // Skip if the file already has language support
  if (hasLanguageSupport(content)) {
    return [];
  }
  
  const strings = [];
  
  // Find m.reply("...") and conn.reply(m.chat, "...", m) patterns
  // This is a simplified approach and might need to be expanded
  
  // Match m.reply("string") or m.reply('string')
  const replyRegex = /m\.reply\(['"](.+?)['"]\)/g;
  let match;
  while ((match = replyRegex.exec(content)) !== null) {
    if (match[1] && match[1].length > 3 && !match[1].includes('%')) {
      strings.push(match[1]);
    }
  }
  
  // Match conn.reply(m.chat, "string", m)
  const connReplyRegex = /conn\.reply\([^,]+,\s*['"](.+?)['"](?:,|\))/g;
  while ((match = connReplyRegex.exec(content)) !== null) {
    if (match[1] && match[1].length > 3 && !match[1].includes('%')) {
      strings.push(match[1]);
    }
  }
  
  // Extract strings from m.reply(`...`) template literals
  // This is more complex due to variable interpolation
  const templateRegex = /m\.reply\(`([^`]+)`\)/g;
  while ((match = templateRegex.exec(content)) !== null) {
    if (match[1] && match[1].length > 3 && !match[1].includes('${')) {
      strings.push(match[1]);
    }
  }
  
  // Return unique strings
  return [...new Set(strings)];
}

/**
 * Generate translation key from string
 * @param {string} text - The text to create a key for
 * @param {string} prefix - Optional prefix for the key
 * @returns {string} - The generated key
 */
function generateTranslationKey(text, prefix = '') {
  // Create a simple key based on the first few words
  const words = text.toLowerCase()
                   .replace(/[^\w\s]/g, '') // Remove punctuation
                   .split(/\s+/)            // Split by whitespace
                   .filter(w => w.length > 2) // Filter out short words
                   .slice(0, 3);             // Take first 3 words
  
  // Join with underscores
  let key = words.join('_');
  
  // If key is too short, add prefix and a random component
  if (key.length < 5) {
    const shortId = uuidv4().substring(0, 8);
    key = `${prefix}${key.length > 0 ? key + '_' : ''}${shortId}`;
  } else if (prefix) {
    key = `${prefix}${key}`;
  }
  
  return key;
}

/**
 * Add a translation to languages.js
 * @param {string} key - Translation key
 * @param {string} englishText - English text
 * @param {string} germanText - German text (can be empty)
 */
async function addTranslationToLanguages(key, englishText, germanText = '') {
  try {
    const languagesFile = path.join(__dirname, 'lib', 'languages.js');
    let content = await fs.readFile(languagesFile, 'utf8');
    
    // Check if the key already exists
    const keyPattern = new RegExp(`'${key}':\\s*'`, 'g');
    if (keyPattern.test(content)) {
      console.log(`${colors.yellow}⚠ Key '${key}' already exists in languages.js${colors.reset}`);
      return false;
    }
    
    // Escape single quotes in the translations
    const escapedEnglish = englishText.replace(/'/g, "\\'");
    const escapedGerman = germanText ? germanText.replace(/'/g, "\\'") : '';
    
    // Find positions to insert
    const enPosition = content.indexOf("'en': {") + 7;
    if (enPosition === -1) {
      console.error(`${colors.red}✗ Could not find English section in languages.js${colors.reset}`);
      return false;
    }
    
    const dePosition = content.indexOf("'de': {") + 7;
    if (dePosition === -1) {
      console.error(`${colors.red}✗ Could not find German section in languages.js${colors.reset}`);
      return false;
    }
    
    // Find appropriate category sections
    const isMenu = englishText.includes('MENU') || englishText.includes('Command');
    const isRpg = englishText.includes('RPG') || englishText.includes('game');
    const isError = englishText.includes('error') || englishText.includes('failed');
    const isGroup = englishText.includes('group') || englishText.includes('admin');
    
    let category = 'other_common';
    if (isMenu) category = 'menu_related';
    else if (isRpg) category = 'rpg_specific';
    else if (isError) category = 'system_messages';
    else if (isGroup) category = 'group_commands';
    
    // Find these sections in the file
    // Simplified approach - in a real implementation, you would check if sections exist
    
    // Create inserts
    const enInsert = `    '${key}': '${escapedEnglish}',\n`;
    const deInsert = escapedGerman ? `    '${key}': '${escapedGerman}',\n` : '';
    
    // Create a backup first
    const backupDir = path.join(__dirname, 'language-backups');
    await fs.mkdir(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(backupDir, `languages-${timestamp}.js`);
    await fs.writeFile(backupFile, content);
    
    // Insert English translation - simplistic approach by adding at end
    const enSectionEnd = content.indexOf("'de':");
    if (enSectionEnd === -1) {
      console.error(`${colors.red}✗ Could not find end of English section in languages.js${colors.reset}`);
      return false;
    }
    
    // Find the closing brace of English section
    const enSectionClose = content.lastIndexOf("}", enSectionEnd);
    const contentBefore = content.substring(0, enSectionClose);
    const contentAfter = content.substring(enSectionClose);
    content = contentBefore + enInsert + contentAfter;
    
    // Insert German translation if provided
    if (deInsert) {
      const deSection = content.indexOf("'de': {");
      const deSectionEnd = content.indexOf("module.exports", deSection);
      if (deSectionEnd === -1) {
        console.error(`${colors.red}✗ Could not find end of German section in languages.js${colors.reset}`);
        return false;
      }
      
      // Find the closing brace of German section
      const deSectionClose = content.lastIndexOf("}", deSectionEnd);
      const contentBefore = content.substring(0, deSectionClose);
      const contentAfter = content.substring(deSectionClose);
      content = contentBefore + deInsert + contentAfter;
    }
    
    // Write updated content
    await fs.writeFile(languagesFile, content);
    console.log(`${colors.green}✓ Added translation for key '${key}' to languages.js${colors.reset}`);
    return true;
    
  } catch (error) {
    console.error(`${colors.red}✗ Error adding translation: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Replace hardcoded strings with getMessage calls
 * @param {string} content - File content
 * @param {Object} translationMap - Map of strings to their keys
 * @returns {string} - Updated content
 */
function replaceHardcodedStrings(content, translationMap) {
  let updatedContent = content;
  
  // Replace simple strings in m.reply("...")
  for (const [string, key] of Object.entries(translationMap)) {
    // Escape special characters in the string for regex
    const escapedString = string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Replace in m.reply("...") - double quotes
    const replyRegexDouble = new RegExp(`m\\.reply\\("${escapedString}"\\)`, 'g');
    updatedContent = updatedContent.replace(replyRegexDouble, `m.reply(getMessage('${key}', lang))`);
    
    // Replace in m.reply('...') - single quotes
    const replyRegexSingle = new RegExp(`m\\.reply\\('${escapedString}'\\)`, 'g');
    updatedContent = updatedContent.replace(replyRegexSingle, `m.reply(getMessage('${key}', lang))`);
    
    // Replace in conn.reply(m.chat, "...", m) - double quotes
    const connReplyRegexDouble = new RegExp(`conn\\.reply\\(m\\.chat, "${escapedString}", m\\)`, 'g');
    updatedContent = updatedContent.replace(connReplyRegexDouble, `conn.reply(m.chat, getMessage('${key}', lang), m)`);
    
    // Replace in conn.reply(m.chat, '...', m) - single quotes
    const connReplyRegexSingle = new RegExp(`conn\\.reply\\(m\\.chat, '${escapedString}', m\\)`, 'g');
    updatedContent = updatedContent.replace(connReplyRegexSingle, `conn.reply(m.chat, getMessage('${key}', lang), m)`);
    
    // Replace in template literals - more complex
    // This is a simplified approach and might need adjustment
    const templateRegex = new RegExp(`m\\.reply\\(\`${escapedString}\`\\)`, 'g');
    updatedContent = updatedContent.replace(templateRegex, `m.reply(getMessage('${key}', lang))`);
  }
  
  return updatedContent;
}

/**
 * Add language retrieval code to the plugin
 * @param {string} content - File content
 * @returns {string} - Updated content with language retrieval
 */
function addLanguageRetrievalCode(content) {
  // This is a simplified implementation
  // Real implementation would need to analyze the file structure
  
  // Check if the handler is async
  const isAsync = content.includes('async') && content.includes('handler');
  
  // Try to find the handler function
  const handlerRegex = isAsync ? 
    /async\s+(?:function\s+)?(?:\w+\s*=\s*)?(?:async\s+)?\(\s*m\s*,\s*\{\s*conn(?:,\s*[\w\s,]+)?\s*\}\s*\)\s*=>\s*{/g :
    /(?:function\s+)?(?:\w+\s*=\s*)?(?:async\s+)?\(\s*m\s*,\s*\{\s*conn(?:,\s*[\w\s,]+)?\s*\}\s*\)\s*=>\s*{/g;
  
  // Replace to add language retrieval
  let updatedContent = content;
  
  // Add language retrieval after handler declaration
  const languageCode = `  // Get user's preferred language
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];
  const lang = user?.language || chat?.language || global.language || 'en';\n\n`;
  
  if (handlerRegex.test(content)) {
    // Add after function opening brace
    updatedContent = content.replace(handlerRegex, (match) => {
      return match + '\n' + languageCode;
    });
  } else {
    // Fallback: try to find the first opening brace
    const braceIndex = content.indexOf('{');
    if (braceIndex !== -1) {
      updatedContent = content.substring(0, braceIndex + 1) + 
                      '\n' + languageCode + 
                      content.substring(braceIndex + 1);
    } else {
      console.log(`${colors.yellow}⚠ Could not find a good place to add language retrieval code${colors.reset}`);
    }
  }
  
  return updatedContent;
}

/**
 * Process a single plugin file
 * @param {string} filePath - Path to the plugin file
 * @returns {boolean} - Whether the file was modified
 */
async function processPlugin(filePath) {
  try {
    console.log(`${colors.blue}Processing file: ${filePath}${colors.reset}`);
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if already has language support
    if (hasLanguageSupport(content)) {
      console.log(`${colors.green}✓ File already has language support${colors.reset}`);
      stats.alreadyTranslationEnabled++;
      return false;
    }
    
    // Extract strings for translation
    const strings = extractStringsForTranslation(content);
    stats.stringsFound += strings.length;
    
    if (strings.length === 0) {
      console.log(`${colors.yellow}⚠ No strings found for translation${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.blue}Found ${strings.length} strings for translation${colors.reset}`);
    
    // Create a translation map (string -> key)
    const translationMap = {};
    
    // Generate prefix from filename
    const filename = path.basename(filePath, '.js');
    const prefix = filename.split('-').pop() + '_';
    
    // Process each string
    for (const string of strings) {
      // Generate a key
      const key = generateTranslationKey(string, prefix);
      translationMap[string] = key;
      
      // Add to languages.js
      await addTranslationToLanguages(key, string);
    }
    
    // Create a backup of the original file
    const backupDir = path.join(__dirname, 'plugin-backups');
    await fs.mkdir(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(backupDir, `${path.basename(filePath)}.${timestamp}.bak`);
    await fs.writeFile(backupFile, content);
    
    // Update the file
    let updatedContent = content;
    
    // 1. Add import for getMessage
    updatedContent = addLanguageImports(updatedContent);
    
    // 2. Add language retrieval code
    updatedContent = addLanguageRetrievalCode(updatedContent);
    
    // 3. Replace hardcoded strings
    updatedContent = replaceHardcodedStrings(updatedContent, translationMap);
    
    // Write the updated content
    await fs.writeFile(filePath, updatedContent);
    
    console.log(`${colors.green}✓ Successfully updated file with translations${colors.reset}`);
    console.log(`${colors.green}✓ Backup created at ${backupFile}${colors.reset}`);
    
    stats.stringsReplaced += strings.length;
    stats.filesModified++;
    return true;
    
  } catch (error) {
    console.error(`${colors.red}✗ Error processing plugin: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Process all plugin files in a directory
 * @param {string} directory - Directory containing plugin files
 */
async function processAllPlugins(directory) {
  try {
    // Get all JS files in the directory
    const files = await fs.readdir(directory);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    console.log(`${colors.blue}Found ${jsFiles.length} JavaScript files${colors.reset}`);
    
    // Process files one by one
    for (const file of jsFiles) {
      const filePath = path.join(directory, file);
      stats.filesProcessed++;
      await processPlugin(filePath);
    }
    
    // Display stats
    console.log(`\n${colors.bright}Translation Statistics:${colors.reset}`);
    console.log(`${colors.blue}Files processed:${colors.reset} ${stats.filesProcessed}`);
    console.log(`${colors.blue}Files already translation-enabled:${colors.reset} ${stats.alreadyTranslationEnabled}`);
    console.log(`${colors.blue}Files modified:${colors.reset} ${stats.filesModified}`);
    console.log(`${colors.blue}Strings found:${colors.reset} ${stats.stringsFound}`);
    console.log(`${colors.blue}Strings replaced:${colors.reset} ${stats.stringsReplaced}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Error processing plugins: ${error.message}${colors.reset}`);
  }
}

/**
 * Process a specific plugin file
 * @param {string} filePath - Path to the specific plugin file
 */
async function processSinglePlugin(filePath) {
  try {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`${colors.red}✗ File not found: ${filePath}${colors.reset}`);
      return;
    }
    
    // Process the file
    stats.filesProcessed++;
    await processPlugin(filePath);
    
    // Display stats
    console.log(`\n${colors.bright}Translation Statistics:${colors.reset}`);
    console.log(`${colors.blue}Files processed:${colors.reset} ${stats.filesProcessed}`);
    console.log(`${colors.blue}Files modified:${colors.reset} ${stats.filesModified}`);
    console.log(`${colors.blue}Strings found:${colors.reset} ${stats.stringsFound}`);
    console.log(`${colors.blue}Strings replaced:${colors.reset} ${stats.stringsReplaced}`);
    
  } catch (error) {
    console.error(`${colors.red}✗ Error processing plugin: ${error.message}${colors.reset}`);
  }
}

/**
 * Display main menu
 */
function showMainMenu() {
  console.log(`\n${colors.bright}WhatsApp Bot Plugin Translator${colors.reset}`);
  console.log(`${colors.blue}═════════════════════════════${colors.reset}\n`);
  console.log(`1. Process All Plugins (plugins directory)`);
  console.log(`2. Process a Specific Plugin`);
  console.log(`3. Exit`);
  
  rl.question(`\n${colors.green}Select an option (1-3):${colors.reset} `, (answer) => {
    switch (answer.trim()) {
      case '1':
        processAllPlugins('./plugins').then(() => {
          rl.close();
        });
        break;
      case '2':
        rl.question(`${colors.green}Enter the plugin file path:${colors.reset} `, (filePath) => {
          processSinglePlugin(filePath).then(() => {
            rl.close();
          });
        });
        break;
      case '3':
        rl.close();
        break;
      default:
        console.log(`${colors.red}Invalid option. Please try again.${colors.reset}`);
        showMainMenu();
        break;
    }
  });
}

/**
 * Process command line arguments
 */
async function processArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showMainMenu();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'all':
      await processAllPlugins('./plugins');
      rl.close();
      break;
    case 'file':
      if (args[1]) {
        await processSinglePlugin(args[1]);
      } else {
        console.error(`${colors.red}✗ Missing file path argument${colors.reset}`);
        console.log(`${colors.blue}ℹ Usage: node plugin-translator.js file <path-to-plugin>${colors.reset}`);
      }
      rl.close();
      break;
    default:
      console.log(`${colors.yellow}Unknown command: ${command}${colors.reset}`);
      console.log(`${colors.blue}Available commands:${colors.reset}`);
      console.log(`  all - Process all plugins in the plugins directory`);
      console.log(`  file <path> - Process a specific plugin file`);
      rl.close();
      break;
  }
}

// Start the script
processArgs();
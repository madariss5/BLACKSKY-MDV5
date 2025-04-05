/**
 * BLACKSKY-MD Premium - WhatsApp Session Backup
 * This script creates backups of WhatsApp session files to prevent
 * connection issues during Heroku dyno cycling.
 * 
 * Running on a cron schedule (default: every 30 minutes)
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

// Configuration
const CONFIG = {
  // Session ID matches the one in config.js
  sessionId: process.env.SESSION_ID || 'BLACKSKY-MD',
  
  // Backup interval in minutes
  backupInterval: parseInt(process.env.BACKUP_INTERVAL || '30', 10),
  
  // Backup enabled flag
  backupEnabled: process.env.BACKUP_ENABLED === 'true',
  
  // Session directory path
  sessionDir: path.join(process.cwd(), 'sessions'),
  
  // Backup directory path
  backupDir: path.join(process.cwd(), 'sessions_backup'),
  
  // PostgreSQL connection from Heroku
  databaseUrl: process.env.DATABASE_URL
};

// Create PostgreSQL pool if DATABASE_URL is available
let pool = null;
if (CONFIG.databaseUrl) {
  pool = new Pool({
    connectionString: CONFIG.databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for Heroku PostgreSQL
    }
  });
  
  // Log successful database connection
  pool.query('SELECT NOW()')
    .then(() => console.log('📦 Connected to PostgreSQL database'))
    .catch(err => console.error('❌ Failed to connect to PostgreSQL:', err.message));
}

/**
 * Backup session files to local backup directory
 */
async function backupSessionFiles() {
  try {
    console.log(`📂 Starting session file backup...`);
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(CONFIG.backupDir)) {
      console.log(`Creating backup directory: ${CONFIG.backupDir}`);
      await mkdir(CONFIG.backupDir, { recursive: true });
    }
    
    // Check if session directory exists
    if (!fs.existsSync(CONFIG.sessionDir)) {
      console.error(`❌ Session directory not found: ${CONFIG.sessionDir}`);
      return;
    }
    
    // Get all session files
    const files = await readdir(CONFIG.sessionDir);
    const sessionFiles = files.filter(file => 
      file.startsWith(CONFIG.sessionId) && !file.endsWith('.backup')
    );
    
    if (sessionFiles.length === 0) {
      console.log(`No session files found for ${CONFIG.sessionId}`);
      return;
    }
    
    // Backup each session file
    let backupCount = 0;
    for (const file of sessionFiles) {
      const sourcePath = path.join(CONFIG.sessionDir, file);
      const destPath = path.join(CONFIG.backupDir, file + '.backup');
      
      // Check if file has changed since last backup
      if (fs.existsSync(destPath)) {
        const sourceStats = await stat(sourcePath);
        const destStats = await stat(destPath);
        
        // Skip if source file is older than backup
        if (sourceStats.mtime <= destStats.mtime) {
          continue;
        }
      }
      
      // Read and write file
      const data = await readFile(sourcePath);
      await writeFile(destPath, data);
      backupCount++;
    }
    
    console.log(`✅ Backed up ${backupCount} session files to ${CONFIG.backupDir}`);
  } catch (error) {
    console.error(`❌ Error backing up session files:`, error.message);
  }
}

/**
 * Backup session data to PostgreSQL database
 */
async function backupSessionToDatabase() {
  if (!pool) {
    console.log('📢 PostgreSQL backup skipped: No DATABASE_URL provided');
    return;
  }
  
  try {
    console.log(`🗄️ Starting session database backup...`);
    
    // Create sessions table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, file_name)
      )
    `);
    
    // Get all session files
    const files = await readdir(CONFIG.sessionDir);
    const sessionFiles = files.filter(file => 
      file.startsWith(CONFIG.sessionId) && !file.endsWith('.backup')
    );
    
    if (sessionFiles.length === 0) {
      console.log(`No session files found for ${CONFIG.sessionId}`);
      return;
    }
    
    // Backup each session file to database
    let backupCount = 0;
    for (const file of sessionFiles) {
      const filePath = path.join(CONFIG.sessionDir, file);
      const fileData = await readFile(filePath);
      
      // Insert or update session data
      await pool.query(`
        INSERT INTO whatsapp_sessions (session_id, file_name, file_data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (session_id, file_name) 
        DO UPDATE SET 
          file_data = $3,
          updated_at = NOW()
      `, [CONFIG.sessionId, file, fileData]);
      
      backupCount++;
    }
    
    console.log(`✅ Backed up ${backupCount} session files to PostgreSQL database`);
  } catch (error) {
    console.error(`❌ Error backing up to database:`, error.message);
  }
}

/**
 * Restore sessions from database if local files are missing or corrupted
 */
async function restoreSessionFromDatabase() {
  if (!pool) {
    console.log('📢 PostgreSQL restore skipped: No DATABASE_URL provided');
    return;
  }
  
  try {
    console.log(`🔄 Checking if session restoration is needed...`);
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(CONFIG.sessionDir)) {
      console.log(`Creating session directory: ${CONFIG.sessionDir}`);
      await mkdir(CONFIG.sessionDir, { recursive: true });
    }
    
    // Get all sessions for this session ID
    const result = await pool.query(`
      SELECT file_name, file_data, updated_at
      FROM whatsapp_sessions
      WHERE session_id = $1
      ORDER BY updated_at DESC
    `, [CONFIG.sessionId]);
    
    if (result.rows.length === 0) {
      console.log(`No database backups found for ${CONFIG.sessionId}`);
      return;
    }
    
    // Check if we need to restore any files
    let restoredCount = 0;
    for (const row of result.rows) {
      const filePath = path.join(CONFIG.sessionDir, row.file_name);
      
      // Restore if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.log(`Restoring missing file: ${row.file_name}`);
        await writeFile(filePath, row.file_data);
        restoredCount++;
        continue;
      }
      
      // Check if local file is valid JSON (if it should be)
      if (row.file_name.endsWith('.json')) {
        try {
          const fileContent = await readFile(filePath, 'utf8');
          JSON.parse(fileContent); // Will throw if invalid JSON
        } catch (e) {
          console.log(`Restoring corrupted JSON file: ${row.file_name}`);
          await writeFile(filePath, row.file_data);
          restoredCount++;
        }
      }
    }
    
    if (restoredCount > 0) {
      console.log(`✅ Restored ${restoredCount} session files from database`);
    } else {
      console.log(`✅ No session restoration needed, all files intact`);
    }
  } catch (error) {
    console.error(`❌ Error restoring from database:`, error.message);
  }
}

async function main() {
  // Check if backup is enabled
  if (!CONFIG.backupEnabled) {
    console.log(`❗ Session backup is disabled. Set BACKUP_ENABLED=true to enable.`);
    process.exit(0);
  }
  
  console.log(`
╔════════════════════════════════════════╗
║      🌌 BLACKSKY-MD SESSION BACKUP     ║
║      ⚡ CYBERPUNK EDITION ⚡            ║
╚════════════════════════════════════════╝
`);
  
  try {
    // First check if we need to restore sessions
    await restoreSessionFromDatabase();
    
    // Then backup current sessions
    await backupSessionFiles();
    await backupSessionToDatabase();
    
    console.log(`✅ Backup completed successfully`);
  } catch (error) {
    console.error(`❌ Backup process error:`, error);
  }
  
  // Close database pool if it exists
  if (pool) {
    await pool.end();
  }
}

// Run directly if called as script
if (require.main === module) {
  main().catch(console.error);
}

// Run on a schedule if configured as a module
if (CONFIG.backupEnabled && CONFIG.backupInterval > 0) {
  setInterval(main, CONFIG.backupInterval * 60 * 1000);
  console.log(`🕒 Session backup scheduled every ${CONFIG.backupInterval} minutes`);
}

// Export functions for use in other modules
module.exports = {
  backupSessionFiles,
  backupSessionToDatabase,
  restoreSessionFromDatabase
};
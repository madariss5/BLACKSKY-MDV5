/**
 * BLACKSKY-MD Premium - WhatsApp Session Backup
 * This script creates backups of WhatsApp session files to prevent
 * connection issues during Heroku dyno cycling.
 * 
 * Running on a cron schedule (default: every 30 minutes)
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { Pool } = require('pg');

// Ensure directories exist
const sessionsDir = path.join(process.cwd(), 'sessions');
const backupDir = path.join(process.cwd(), 'sessions-backup');
const tmpDir = path.join(process.cwd(), 'tmp');

// Create directories if they don't exist
for (const dir of [sessionsDir, backupDir, tmpDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Get session ID
const sessionId = process.env.SESSION_ID || 'BLACKSKY-MD';
console.log(`Using session ID: ${sessionId}`);

// Initialize PostgreSQL connection if available
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('PostgreSQL connection initialized');
}

/**
 * Backup session files to local backup directory
 */
async function backupSessionFiles() {
  console.log('Starting session file backup...');
  
  try {
    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(file => file.startsWith(sessionId))
      .map(file => path.join(sessionsDir, file));
    
    if (sessionFiles.length === 0) {
      console.log('No session files found to backup');
      return;
    }
    
    console.log(`Found ${sessionFiles.length} session files to backup`);
    
    // Copy each file to backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    for (const file of sessionFiles) {
      const fileName = path.basename(file);
      const backupFile = path.join(backupDir, `${fileName}.${timestamp}`);
      
      // Copy the file
      fs.copyFileSync(file, backupFile);
      console.log(`Backed up ${fileName} to ${backupFile}`);
    }
    
    // Clean up old backups (keep only the 5 most recent)
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(sessionId))
      .sort((a, b) => {
        const statsA = fs.statSync(path.join(backupDir, a));
        const statsB = fs.statSync(path.join(backupDir, b));
        return statsB.mtime.getTime() - statsA.mtime.getTime();
      });
    
    if (backupFiles.length > 5) {
      const filesToDelete = backupFiles.slice(5);
      for (const file of filesToDelete) {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`Deleted old backup: ${file}`);
      }
    }
    
    console.log('Session file backup completed successfully');
    return true;
  } catch (error) {
    console.error('Error during session file backup:', error);
    return false;
  }
}

/**
 * Backup session data to PostgreSQL database
 */
async function backupSessionToDatabase() {
  if (!pool) {
    console.log('PostgreSQL connection not available, skipping database backup');
    return;
  }
  
  console.log('Starting session database backup...');
  
  try {
    // Check if the sessions table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Create the sessions table
      await pool.query(`
        CREATE TABLE sessions (
          id SERIAL PRIMARY KEY,
          session_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          data BYTEA NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_sessions_session_id ON sessions(session_id);
      `);
      console.log('Created sessions table');
    }
    
    // Find session files
    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(file => file.startsWith(sessionId));
    
    if (sessionFiles.length === 0) {
      console.log('No session files found to backup to database');
      return;
    }
    
    console.log(`Found ${sessionFiles.length} session files to backup to database`);
    
    // For each file, update or insert into database
    for (const fileName of sessionFiles) {
      const filePath = path.join(sessionsDir, fileName);
      const fileData = fs.readFileSync(filePath);
      
      // Check if record already exists
      const existingRecord = await pool.query(
        'SELECT id FROM sessions WHERE session_id = $1 AND file_name = $2',
        [sessionId, fileName]
      );
      
      if (existingRecord.rows.length > 0) {
        // Update existing record
        await pool.query(
          'UPDATE sessions SET data = $1, updated_at = NOW() WHERE session_id = $2 AND file_name = $3',
          [fileData, sessionId, fileName]
        );
        console.log(`Updated database record for ${fileName}`);
      } else {
        // Insert new record
        await pool.query(
          'INSERT INTO sessions (session_id, file_name, data) VALUES ($1, $2, $3)',
          [sessionId, fileName, fileData]
        );
        console.log(`Inserted new database record for ${fileName}`);
      }
    }
    
    // Clean up old records (keep only the 5 most recent per file)
    await pool.query(`
      DELETE FROM sessions
      WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER(PARTITION BY session_id, file_name ORDER BY updated_at DESC) as row_num
          FROM sessions
          WHERE session_id = $1
        ) t
        WHERE t.row_num > 5
      )
    `, [sessionId]);
    
    console.log('Session database backup completed successfully');
    return true;
  } catch (error) {
    console.error('Error during session database backup:', error);
    return false;
  }
}

/**
 * Restore sessions from database if local files are missing or corrupted
 */
async function restoreSessionFromDatabase() {
  if (!pool) {
    console.log('PostgreSQL connection not available, skipping database restore');
    return;
  }
  
  console.log('Checking if session restore from database is needed...');
  
  try {
    // Check if session files exist locally
    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(file => file.startsWith(sessionId));
    
    if (sessionFiles.length > 0) {
      console.log('Local session files exist, no need to restore from database');
      return;
    }
    
    console.log('No local session files found, attempting to restore from database...');
    
    // Get the latest session files from database
    const result = await pool.query(`
      SELECT DISTINCT ON (file_name) file_name, data
      FROM sessions
      WHERE session_id = $1
      ORDER BY file_name, updated_at DESC
    `, [sessionId]);
    
    if (result.rows.length === 0) {
      console.log('No session backups found in database');
      return;
    }
    
    console.log(`Found ${result.rows.length} session files in database`);
    
    // Restore each file
    for (const row of result.rows) {
      const filePath = path.join(sessionsDir, row.file_name);
      fs.writeFileSync(filePath, row.data);
      console.log(`Restored ${row.file_name} from database`);
    }
    
    console.log('Session restore from database completed successfully');
    return true;
  } catch (error) {
    console.error('Error during session restore from database:', error);
    return false;
  }
}

async function main() {
  console.log('Starting WhatsApp session backup process...');
  
  try {
    // Try to restore session from database if needed
    await restoreSessionFromDatabase();
    
    // Backup session files locally
    await backupSessionFiles();
    
    // Backup to database
    await backupSessionToDatabase();
    
    console.log('WhatsApp session backup process completed');
  } catch (error) {
    console.error('Error in backup process:', error);
  } finally {
    // Close database connection
    if (pool) {
      await pool.end();
    }
  }
}

// Run the backup process
main();
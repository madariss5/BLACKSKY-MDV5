/**
 * BLACKSKY-MD Premium - Heroku Deployment Script
 * 
 * This script sets up direct PM2 integration for Heroku deployment
 * without relying on ecosystem.config.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if PM2 is installed
function checkPM2Installed() {
  try {
    const result = require('child_process').execSync('pm2 --version', { encoding: 'utf8' });
    console.log(`✅ PM2 is installed (${result.trim()})`);
    return true;
  } catch (error) {
    console.log('❌ PM2 is not installed');
    return false;
  }
}

// Install PM2 if not already installed
async function installPM2IfNeeded() {
  if (!checkPM2Installed()) {
    console.log('🔄 Installing PM2...');
    
    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install', '-g', 'pm2'], { stdio: 'inherit' });
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ PM2 installed successfully');
          resolve(true);
        } else {
          console.error(`❌ Failed to install PM2 (exit code: ${code})`);
          reject(new Error(`Failed to install PM2 (exit code: ${code})`));
        }
      });
    });
  }
  
  return Promise.resolve(true);
}

// Create logs directory if it doesn't exist
function setupLogsDirectory() {
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logsDir)) {
    console.log('📁 Creating logs directory...');
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Start the bot with PM2
async function startBotWithPM2() {
  console.log('🚀 Starting bot with PM2...');
  
  // Define PM2 options
  const pm2Options = [
    'start',
    'heroku-bot-starter.js',
    '--name', 'BLACKSKY-MD',
    '--exp-backoff-restart-delay=100',
    '--max-memory-restart=512M',
    '--log', './logs/combined.log',
    '--time',
    '--restart-delay=5000',
    '--max-restarts=50',
    '--min-uptime=60000',
    '--listen-timeout=15000',
    '--kill-timeout=8000',
    '--wait-ready',
    '--node-args="--expose-gc --max-old-space-size=512 --optimize-for-size --max-http-header-size=8192 --no-warnings --abort-on-uncaught-exception=false --unhandled-rejections=warn"',
    '--cron-restart="0 4 * * *"',
    '--',
    '--autocleartmp',
    '--autoread'
  ];
  
  return new Promise((resolve, reject) => {
    const pm2Start = spawn('pm2', pm2Options, { stdio: 'inherit' });
    
    pm2Start.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Bot started successfully with PM2');
        resolve(true);
      } else {
        console.error(`❌ Failed to start bot with PM2 (exit code: ${code})`);
        reject(new Error(`Failed to start bot with PM2 (exit code: ${code})`));
      }
    });
  });
}

// Save PM2 process list
async function savePM2ProcessList() {
  console.log('💾 Saving PM2 process list...');
  
  return new Promise((resolve, reject) => {
    const pm2Save = spawn('pm2', ['save'], { stdio: 'inherit' });
    
    pm2Save.on('close', (code) => {
      if (code === 0) {
        console.log('✅ PM2 process list saved successfully');
        resolve(true);
      } else {
        console.error(`❌ Failed to save PM2 process list (exit code: ${code})`);
        reject(new Error(`Failed to save PM2 process list (exit code: ${code})`));
      }
    });
  });
}

// Setup Heroku PM2 startup script
function setupHerokuPM2Startup() {
  console.log('📝 Setting up Heroku PM2 startup...');
  
  // Create Procfile for Heroku
  const procfilePath = path.join(process.cwd(), 'Procfile');
  const procfileContent = 'web: pm2-runtime start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread';
  
  fs.writeFileSync(procfilePath, procfileContent);
  console.log('✅ Procfile created successfully');
  
  // Update package.json scripts
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packageJsonPath);
    
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.start = 'pm2-runtime start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread';
    packageJson.scripts['start:pm2'] = 'pm2 start heroku-bot-starter.js --name BLACKSKY-MD -- --autocleartmp --autoread';
    packageJson.scripts['heroku-postbuild'] = 'npm install pm2 -g';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json updated successfully');
  } catch (error) {
    console.error('❌ Failed to update package.json:', error);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting BLACKSKY-MD Heroku PM2 setup...');
  
  try {
    // Setup logs directory
    setupLogsDirectory();
    
    // Setup Heroku PM2 startup
    setupHerokuPM2Startup();
    
    // For local development only - not needed on Heroku as pm2-runtime is used
    if (process.env.NODE_ENV !== 'production') {
      await installPM2IfNeeded();
      await startBotWithPM2();
      await savePM2ProcessList();
    }
    
    console.log('✅ Setup complete!');
    console.log('ℹ️ On Heroku, the bot will start automatically using PM2 Runtime.');
    console.log('ℹ️ For local development, run: npm run start:pm2');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
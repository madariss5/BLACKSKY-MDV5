const cluster = require('cluster');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const app = express();

// Import notification queue system
const { 
  sendNotificationWithRetry,
  processNotificationQueue, 
  clearNotificationQueue,
  getNotificationStats,
  setupNotificationQueue
} = require('./notification-queue');

// Make notification queue available globally
global.notificationQueue = {
  sendNotificationWithRetry,
  processNotificationQueue,
  clearNotificationQueue,
  getNotificationStats
};

// Express.js 
const ports = [4000, 3000, 5000, 8000];
let availablePortIndex = 0;

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', reject);
  });
}

async function startServer() {
  // Use Heroku's PORT environment variable if available, otherwise use our port array
  const port = process.env.PORT || ports[availablePortIndex];
  const isPortAvailable = await checkPort(port);

  if (isPortAvailable) {
    // Premium startup message
    const logo = `
    ╔════════════════════════════════════════╗
    ║      🌌 BLACKSKY-MD PREMIUM 🌌         ║
    ║      ⚡ CYBERPUNK EDITION ⚡            ║
    ╚════════════════════════════════════════╝
    `;
    console.log('\x1b[35m%s\x1b[0m', logo); // Purple color for premium branding
    console.log('\x1b[33m%s\x1b[0m', `🌐 Port ${port} is open`);
    
    // Helper function to format uptime
    function formatUptime(seconds) {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    }
    
    // Premium cyberpunk-styled home page
    app.get('/', (req, res) => {
      res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>BLACKSKY-MD | Premium Cyberpunk WhatsApp Bot</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400;700&display=swap');
              
              :root {
                  --primary: #0df;
                  --primary-glow: rgba(0,221,255,0.5);
                  --secondary: #f0c;
                  --secondary-glow: rgba(255,0,204,0.5);
                  --success: #0f6;
                  --success-glow: rgba(0,255,102,0.5);
                  --bg-dark: #121212;
                  --bg-card: #1e1e1e;
                  --bg-card-alt: #2a2a2a;
                  --text: #eee;
                  --text-muted: #888;
              }
              
              * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
              }
              
              body {
                  font-family: 'Roboto', sans-serif;
                  background: var(--bg-dark);
                  color: var(--text);
                  line-height: 1.6;
                  background-image: 
                      radial-gradient(circle at 10% 20%, rgba(0,221,255,0.05) 0%, transparent 20%),
                      radial-gradient(circle at 90% 80%, rgba(255,0,204,0.05) 0%, transparent 20%),
                      linear-gradient(to bottom, var(--bg-dark), #0a0a14);
                  background-attachment: fixed;
                  min-height: 100vh;
                  overflow-x: hidden;
              }
              
              .container {
                  max-width: 900px;
                  margin: 40px auto;
                  background: rgba(30, 30, 30, 0.9);
                  border-radius: 15px;
                  padding: 30px;
                  box-shadow: 
                      0 0 20px rgba(0,0,0,0.7),
                      0 0 30px rgba(0,221,255,0.1),
                      0 0 50px rgba(255,0,204,0.1);
                  border: 1px solid rgba(0,221,255,0.1);
                  position: relative;
                  overflow: hidden;
              }
              
              .container::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: linear-gradient(
                      to bottom right,
                      transparent,
                      transparent,
                      transparent,
                      rgba(0,221,255,0.05),
                      transparent
                  );
                  transform: rotate(30deg);
                  animation: shimmer 7s linear infinite;
                  pointer-events: none;
              }
              
              @keyframes shimmer {
                  0% { transform: translateY(-50%) rotate(20deg); }
                  100% { transform: translateY(50%) rotate(20deg); }
              }
              
              @keyframes pulse {
                  0% { box-shadow: 0 0 5px var(--primary-glow); }
                  50% { box-shadow: 0 0 15px var(--primary-glow), 0 0 20px var(--secondary-glow); }
                  100% { box-shadow: 0 0 5px var(--primary-glow); }
              }
              
              @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
              }
              
              .header {
                  text-align: center;
                  margin-bottom: 30px;
                  position: relative;
              }
              
              .logo {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 2.6rem;
                  font-weight: 700;
                  color: var(--primary);
                  text-shadow: 
                      0 0 5px var(--primary-glow),
                      0 0 10px var(--primary-glow),
                      0 0 15px var(--primary-glow);
                  letter-spacing: 2px;
                  margin-bottom: 5px;
              }
              
              .tagline {
                  font-size: 1.1rem;
                  font-weight: 300;
                  color: var(--secondary);
                  text-shadow: 0 0 5px var(--secondary-glow);
                  letter-spacing: 1px;
                  margin-bottom: 15px;
              }
              
              .status-pill {
                  background: var(--bg-card-alt);
                  border-radius: 30px;
                  padding: 8px 20px;
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  font-family: 'Orbitron', sans-serif;
                  font-size: 0.9rem;
                  border: 1px solid rgba(0,221,255,0.2);
                  animation: pulse 3s infinite;
              }
              
              .status-dot {
                  width: 12px;
                  height: 12px;
                  background: var(--success);
                  border-radius: 50%;
                  display: inline-block;
                  box-shadow: 0 0 5px var(--success-glow);
                  animation: blink 2s infinite;
              }
              
              .grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                  gap: 20px;
                  margin: 30px 0;
              }
              
              .card {
                  background: var(--bg-card-alt);
                  border-radius: 10px;
                  padding: 20px;
                  border-left: 3px solid var(--primary);
                  transition: all 0.3s ease;
              }
              
              .card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
              }
              
              .card-title {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 1.2rem;
                  color: var(--primary);
                  margin-bottom: 15px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              
              .card-content p {
                  margin-bottom: 8px;
                  font-size: 0.95rem;
              }
              
              .card-content .highlight {
                  color: var(--primary);
                  font-weight: bold;
              }
              
              .footer {
                  margin-top: 40px;
                  text-align: center;
                  font-size: 0.9rem;
                  color: var(--text-muted);
                  padding-top: 20px;
                  border-top: 1px solid rgba(0,221,255,0.1);
              }
              
              .wave {
                  display: inline-block;
                  animation: wave 1.5s infinite;
                  transform-origin: 70% 70%;
              }
              
              @keyframes wave {
                  0% { transform: rotate(0deg); }
                  10% { transform: rotate(14deg); }
                  20% { transform: rotate(-8deg); }
                  30% { transform: rotate(14deg); }
                  40% { transform: rotate(-4deg); }
                  50% { transform: rotate(10deg); }
                  60% { transform: rotate(0deg); }
                  100% { transform: rotate(0deg); }
              }
              
              .badge {
                  background: var(--bg-dark);
                  border-radius: 5px;
                  padding: 3px 8px;
                  font-size: 0.8rem;
                  color: var(--primary);
                  border: 1px solid var(--primary);
                  margin-right: 5px;
                  display: inline-block;
                  margin-bottom: 5px;
              }
              
              .whatsapp-btn {
                  display: inline-block;
                  background: linear-gradient(45deg, #0df, #0af);
                  color: #000;
                  font-family: 'Orbitron', sans-serif;
                  text-decoration: none;
                  padding: 10px 25px;
                  border-radius: 30px;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                  margin-top: 15px;
                  transition: all 0.3s ease;
                  text-shadow: none;
                  box-shadow: 0 5px 15px rgba(0,221,255,0.3);
              }
              
              .whatsapp-btn:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 7px 20px rgba(0,221,255,0.5);
              }
              
              @media (max-width: 768px) {
                  .container {
                      margin: 20px;
                      padding: 20px;
                  }
                  
                  .logo {
                      font-size: 2rem;
                  }
                  
                  .grid {
                      grid-template-columns: 1fr;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div style="text-align: center; margin-bottom: 20px;">
                      <img src="/logo" alt="BLACKSKY-MD Premium Logo" style="max-width: 200px; height: auto;" />
                  </div>
                  <div class="logo">BLACKSKY-MD</div>
                  <div class="tagline">PREMIUM CYBERPUNK WHATSAPP BOT</div>
                  
                  <div class="status-pill">
                      <span class="status-dot"></span>
                      <span>SYSTEM ${global.conn?.user ? "CONNECTED" : "INITIALIZING"}</span>
                  </div>
              </div>
              
              <div class="grid">
                  <div class="card">
                      <div class="card-title">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm1-13h-2v6h6v-2h-4V7z" fill="#0df"/>
                          </svg>
                          System Status
                      </div>
                      <div class="card-content">
                          <p>Platform: <span class="highlight">${os.platform()} ${os.arch()}</span></p>
                          <p>Node.js: <span class="highlight">${process.version}</span></p>
                          <p>Memory Usage: <span class="highlight">${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</span></p>
                          <p>Uptime: <span class="highlight">${formatUptime(process.uptime())}</span></p>
                      </div>
                  </div>
                  
                  <div class="card">
                      <div class="card-title">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2c-4.42 0-8 3.58-8 8 0 1.65.55 3.15 1.44 4.37l-.92 2.97 2.9-.94c1.2.85 2.66 1.35 4.25 1.35 1.58 0 3.03-.5 4.23-1.34l2.92.94-.91-2.97c.89-1.21 1.43-2.71 1.43-4.36 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#0df"/>
                          </svg>
                          Bot Information
                      </div>
                      <div class="card-content">
                          <p>Bot Name: <span class="highlight">${process.env.BOT_NAME || "BLACKSKY-MD"}</span></p>
                          <p>Environment: <span class="highlight">${process.env.NODE_ENV || "development"}</span></p>
                          <p>WhatsApp: <span class="highlight">${global.conn?.user ? "Connected ✓" : "Waiting for connection..."}</span></p>
                          <p>
                              <span class="badge">YouTube</span>
                              <span class="badge">Games</span>
                              <span class="badge">NSFW</span>
                              <span class="badge">AI</span>
                              <span class="badge">Premium</span>
                          </p>
                      </div>
                  </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                  <p style="margin-bottom: 15px;">Invite BLACKSKY-MD to your WhatsApp group for premium cyberpunk experience!</p>
                  <a href="https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q" class="whatsapp-btn">
                      JOIN OFFICIAL CHANNEL
                  </a>
              </div>
              
              <div class="footer">
                  <p>BLACKSKY-MD CYBERPUNK EDITION <span class="wave">🤖</span></p>
                  <p style="margin-top: 5px;">© 2025 | Serving Premium WhatsApp Experience</p>
              </div>
          </div>
      </body>
      </html>
      `);
    });
    
    // Serve the premium logo - now with PNG conversion for better compatibility
    app.get('/logo', async (req, res) => {
      try {
        // First try to serve the SVG-converted-to-PNG version
        const { svgToPng } = require('./lib/svg-converter');
        const logoPath = path.join(__dirname, 'blacksky-premium-logo.svg');
        
        if (fs.existsSync(logoPath)) {
          try {
            // Convert SVG to PNG for better compatibility
            const pngBuffer = await svgToPng(logoPath, {
              width: 500,
              height: 500,
              background: { r: 18, g: 18, b: 18, alpha: 1 } // Dark background matching the website
            });
            
            res.setHeader('Content-Type', 'image/png');
            res.send(pngBuffer);
            console.log('Successfully served PNG-converted logo');
          } catch (conversionError) {
            console.error('Error converting SVG to PNG, falling back to direct SVG:', conversionError);
            // Fall back to direct SVG if conversion fails
            res.setHeader('Content-Type', 'image/svg+xml');
            res.sendFile(logoPath);
          }
        } else {
          // Try alternate logo files
          const alternateLogos = [
            'blacksky-logo-premium.svg',
            'blacksky-logo.svg',
            'blacksky-md-updated.jpg'
          ];
          
          let found = false;
          for (const logo of alternateLogos) {
            const altPath = path.join(__dirname, logo);
            if (fs.existsSync(altPath)) {
              if (logo.endsWith('.svg')) {
                try {
                  // Convert SVG to PNG
                  const pngBuffer = await svgToPng(altPath, {
                    width: 500,
                    height: 500,
                    background: { r: 18, g: 18, b: 18, alpha: 1 }
                  });
                  
                  res.setHeader('Content-Type', 'image/png');
                  res.send(pngBuffer);
                } catch (err) {
                  // Fallback to direct SVG
                  res.setHeader('Content-Type', 'image/svg+xml');
                  res.sendFile(altPath);
                }
              } else {
                // For JPG/PNG files
                res.sendFile(altPath);
              }
              found = true;
              console.log(`Using alternate logo: ${logo}`);
              break;
            }
          }
          
          if (!found) {
            console.error('No logo files found');
            res.status(404).send('Logo not found');
          }
        }
      } catch (error) {
        console.error('Error serving logo:', error);
        res.status(500).send('Error serving logo');
      }
    });
    
    // Health check endpoint for monitoring
    app.get('/health', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        connection: {
          connected: !!global.conn?.user,
          user: global.conn?.user?.name || null
        }
      });
    });
    
    // Start the server
    const server = app.listen(port, () => {
      console.log('\x1b[32m%s\x1b[0m', `🚀 Server running on port ${port}`);
      
      // Initialize notification queue system if connection exists
      if (global.conn) {
        setupNotificationQueue(global.conn);
        console.log('\x1b[36m%s\x1b[0m', '📨 Notification queue system initialized');
      }
    });
    
    server.on('error', (err) => {
      console.error('\x1b[31m%s\x1b[0m', `❌ Server error: ${err.message}`);
    });
    
  } else {
    console.log(`Port ${port} is already in use. Trying another port...`);
    availablePortIndex++;

    if (availablePortIndex >= ports.length) {
      console.log('No more available ports. Exiting...');
      process.exit(1);
    } else {
      ports[availablePortIndex] = parseInt(port) + 1;
      startServer();
    }
  }
}

startServer();

let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [path.join(__dirname, file), ...process.argv.slice(2)];
  const p = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  p.on("message", (data) => {
    console.log('\x1b[36m%s\x1b[0m', `🟢 RECEIVED ${data}`);
    switch (data) {
      case "reset":
        p.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case "uptime":
        p.send(process.uptime());
        break;
    }
  });

  p.on("exit", (code) => {
    isRunning = false;
    console.error('\x1b[31m%s\x1b[0m', `Exited with code: ${code}`);
    start('main.js');

    if (code === 0) return;

    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
          console.error('\x1b[31m%s\x1b[0m', `File ${args[0]} has been modified. Script will restart...`);
      start("main.js");
    });
  });

  p.on("error", (err) => {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${err}`);
    p.kill();
    isRunning = false;
    console.error('\x1b[31m%s\x1b[0m', `Error occurred. Script will restart...`);
    start("main.js");
  });

  const pluginsFolder = path.join(__dirname, "plugins");

  fs.readdir(pluginsFolder, (err, files) => {
    if (err) {
      console.error('\x1b[31m%s\x1b[0m', `Error reading plugins folder: ${err}`);
      return;
    }
    console.log('\x1b[33m%s\x1b[0m', `🟡 Found ${files.length} plugins in folder ${pluginsFolder}`);
    try {
      require.resolve('@adiwajshing/baileys');
      console.log('\x1b[33m%s\x1b[0m', `🟡 Baileys library version ${require('@adiwajshing/baileys/package.json').version} is installed`);
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Baileys library is not installed`);
    }
  });

  console.log(`🖥️ \x1b[33m${os.type()}\x1b[0m, \x1b[33m${os.release()}\x1b[0m - \x1b[33m${os.arch()}\x1b[0m`);
  const ramInGB = os.totalmem() / (1024 * 1024 * 1024);
  console.log(`💾 \x1b[33mTotal RAM: ${ramInGB.toFixed(2)} GB\x1b[0m`);
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024);
  console.log(`💽 \x1b[33mFree RAM: ${freeRamInGB.toFixed(2)} GB\x1b[0m`);
  console.log('\x1b[33m%s\x1b[0m', `📃 Script by BETABOTZ`);

  setInterval(() => {}, 1000);
}

start("main.js");

const tmpDir = './tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log('\x1b[33m%s\x1b[0m', `📁 Created directory ${tmpDir}`);
}

process.on('unhandledRejection', (reason) => {
  console.error('\x1b[31m%s\x1b[0m', `Unhandled promise rejection: ${reason}`);
  console.error('\x1b[31m%s\x1b[0m', 'Attempting to recover...');
  // More graceful error handling for production
  if (global.conn?.user) {
    console.log('WhatsApp connection still alive, continuing...');
  } else {
    console.log('Restarting bot...');
    start('main.js');
  }
});

process.on('exit', (code) => {
  console.error(`Exited with code: ${code}`);
  console.error('Script will restart...');
  start('main.js');
});

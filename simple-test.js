/**
 * Simple test script for BLACKSKY-MD
 * Just opens the port and logs success
 */

const express = require('express');
const app = express();
const PORT = 5678; // Use a different port

// Create a simple homepage
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>BLACKSKY-MD Bot</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>BLACKSKY-MD WhatsApp Bot</h1>
        <p>Server is running successfully!</p>
        <p>Uptime: ${process.uptime().toFixed(2)} seconds</p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

console.log("This is just a test server to ensure port binding works. It doesn't start the actual bot.");
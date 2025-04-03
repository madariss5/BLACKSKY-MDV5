# Essential API Keys for BLACKSKY-MD

This document outlines the **absolutely necessary** API keys needed for basic functionality of the BLACKSKY-MD WhatsApp Bot. For a full list of supported APIs, see the comprehensive `API-KEYS-README.md`.

## Critical API Keys

### 1. BetaBotz API Key (REQUIRED)
- **Purpose**: Core functionality for many commands
- **Register**: Visit https://api.betabotz.eu.org to create an account
- **Configuration**: In `config.js`, set `global.lann = 'YOUR_API_KEY_HERE'`
- **Impact if Missing**: Many core commands will fail

### 2. OpenAI API Key
- **Purpose**: AI chat functionality (`.ai`, `.gpt`, `.dalle` commands)
- **Register**: Visit https://platform.openai.com/api-keys
- **Configuration**: Add to `config.js` or set as environment variable `OPENAI_API_KEY`
- **Impact if Missing**: AI-based features will not work

## How to Add API Keys

### Method 1: In config.js
1. Copy `config.example.js` to `config.js`
2. Replace placeholder values with your actual API keys
3. Example:
   ```javascript
   global.lann = 'YOUR_BETABOTZ_API_KEY' // REQUIRED
   
   global.APIs = {   
     lann: 'https://api.betabotz.eu.org',
     openai: 'https://api.openai.com/v1'
   }
   
   global.APIKeys = { 
     'https://api.betabotz.eu.org': global.lann,
     'https://api.openai.com/v1': 'YOUR_OPENAI_API_KEY'
   }
   ```

### Method 2: Environment Variables (Recommended for Deployments)
For Heroku, Replit, or other hosting platforms, set these environment variables:
```
BETABOTZ_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Testing Your API Keys

After adding your API keys, you can test if they're working:

1. Start the bot: `npm start`
2. For BetaBotz API: Try `.weather London` command
3. For OpenAI API: Try `.ai hello` command

If the commands work, your API keys are correctly configured.

## Security Note

Keep your API keys secure and never share them publicly. Treat them as sensitive credentials.

For more detailed information about all supported APIs and troubleshooting, see the full `API-KEYS-README.md` file.
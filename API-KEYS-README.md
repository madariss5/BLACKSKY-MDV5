# BLACKSKY-MD API Keys Configuration Guide

This document explains how to set up the required API keys for BLACKSKY-MD Premium WhatsApp Bot and also addresses some known issues with game commands.

## Table of Contents

1. [Required API Keys](#required-api-keys)
2. [How to Configure API Keys](#how-to-configure-api-keys)
3. [API Key Status](#api-key-status)
4. [Known Issues with Game Commands](#known-issues-with-game-commands)
5. [Troubleshooting](#troubleshooting)

## Required API Keys

BLACKSKY-MD uses several external APIs to provide various features. Here's a list of the required API keys:

### Weather Commands
- **OpenWeatherMap API**: Required for `.weather`, `.forecast` commands
  - Get a free API key at: [OpenWeatherMap](https://openweathermap.org/api)
  - Free tier allows 1,000 calls/day

### AI and Chat Features
- **OpenAI API Key**: Required for `.ai`, `.gpt`, `.dalle` commands
  - Get an API key at: [OpenAI Platform](https://platform.openai.com/api-keys)
  - Pay-as-you-go pricing model

### Image and Media Commands
- **Removebg API**: Required for `.removebg` command (background removal)
  - Get API key at: [Remove.bg](https://www.remove.bg/api)
  - Free tier: 50 images/month

### Search and Information Commands
- **Google Custom Search API**: Required for `.google`, `.image` commands
  - Get API key at: [Google Cloud Console](https://console.cloud.google.com/)
  - Create a Custom Search Engine ID as well
  - Free tier: 100 searches/day

### Translation Features
- **Google Translate API**: Built-in for free, no key required
  - Used by the multilingual system and `.translate` command

### Video and Audio Downloads
- **YouTube Data API**: Required for enhanced `.ytmp3`, `.ytmp4` commands
  - Get API key at: [Google Cloud Console](https://console.cloud.google.com/)
  - Free tier: 10,000 units/day

## How to Configure API Keys

There are two ways to add your API keys to BLACKSKY-MD:

### Method 1: Environment Variables (Recommended for Heroku)

Add the following environment variables to your Heroku app or `.env` file:

```
OPENWEATHERMAP_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
REMOVEBG_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
GOOGLE_CSE_ID=your_cse_id_here
YOUTUBE_API_KEY=your_key_here
```

For Heroku:
1. Go to your app's dashboard
2. Navigate to Settings > Config Vars
3. Add each key-value pair

### Method 2: Edit `config.js` (Local Deployment)

Open `config.js` and find the APIs section:

```javascript
// Edit these with your API keys
global.APIs = {
  // Add your API endpoints here
  xteam: 'https://api.xteam.xyz',
  openweather: 'https://api.openweathermap.org/data/2.5',
  openai: 'https://api.openai.com/v1',
  // other APIs...
}

// API Keys
global.APIKeys = {
  // Add your API keys here
  'https://api.openweathermap.org/data/2.5': 'your_openweathermap_key_here',
  'https://api.openai.com/v1': 'your_openai_key_here',
  // other API keys...
}
```

Replace the placeholder values with your actual API keys.

## API Key Status

Here's the current status of API-dependent commands:

| Command | API Required | Status | Notes |
|---------|--------------|--------|-------|
| `.weather` | OpenWeatherMap | ✅ Working | Requires valid API key |
| `.forecast` | OpenWeatherMap | ✅ Working | 5-day forecast |
| `.ai` | OpenAI | ✅ Working | GPT-3.5 model |
| `.gpt` | OpenAI | ✅ Working | Latest GPT model |
| `.dalle` | OpenAI | ✅ Working | Image generation |
| `.google` | Google CSE | ✅ Working | Web search |
| `.image` | Google CSE | ✅ Working | Image search |
| `.removebg` | Remove.bg | ✅ Working | Background removal |
| `.ytmp3` | YouTube | ✅ Working | Enhanced with API |
| `.ytmp4` | YouTube | ✅ Working | Enhanced with API |

## Known Issues with Game Commands

Currently, some game commands have issues with translations and functionality:

### Rock Paper Scissors (`.rps`)
- **Issue**: Missing translations for German language
- **Status**: Not working correctly in German mode
- **Fix**: Translation files need to be updated

### Other Games with Translation Issues
- `.ttt` (Tic-Tac-Toe)
- `.slot` (Slot Machine)
- `.rpg` (RPG Game System)
- `.casino`
- `.gunshop`

### How to Fix Game Translation Issues

To fix the game command translations:

1. Check `plugins/game-*.js` files for hardcoded English text
2. Use the proper translation system with English and German variants:

```javascript
const message = isGerman ? 
  'Wähle Schere, Stein oder Papier!' : 
  'Choose rock, paper, or scissors!';
```

3. For RPG games, more extensive translation work is needed in the `lib/rpg.js` system

## Troubleshooting

### API Keys Not Working

1. Verify the API key is valid and active
2. Check API usage limits (you may have hit free tier limits)
3. Ensure the API key is correctly formatted in your config
4. Some APIs require additional setup (like Google CSE requires a search engine ID)

### Game Commands Not Working

1. Check if you're using the German language setting (`.setlang de`)
2. Some games may have compatibility issues with the latest WhatsApp version
3. Try updating the plugins or temporarily switch to English (`.setlang en`)

## Support

If you need help with API keys or game command issues:

- Open an issue on the GitHub repository
- Contact the developer via WhatsApp support channel
- Check the documentation for updates

## Important Note

Never share your API keys publicly or commit them to public repositories. API keys should be treated as sensitive credentials.
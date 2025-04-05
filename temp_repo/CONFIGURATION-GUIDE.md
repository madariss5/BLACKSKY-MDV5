# BLACKSKY-MD Configuration Guide
> Essential setup for API keys and fixing game commands

## API Keys Setup

### Required API Keys

To make all commands work properly, you need these API keys:

| Command | API Provider | Get Key At | Free Tier |
|---------|-------------|------------|-----------|
| `.weather` | OpenWeatherMap | [Register here](https://home.openweathermap.org/users/sign_up) | 1,000 calls/day |
| `.ai` `.gpt` | OpenAI | [Register here](https://platform.openai.com/signup) | Pay-as-you-go |
| `.removebg` | Remove.bg | [Register here](https://www.remove.bg/api) | 50 images/month |
| `.google` `.image` | Google | [Register here](https://console.cloud.google.com/) | 100 searches/day |

### Adding API Keys to BLACKSKY-MD

#### For Heroku Deployment:

1. Go to your Heroku dashboard → Settings → Config Vars
2. Add these variables:
   ```
   OPENWEATHERMAP_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   REMOVEBG_API_KEY=your_key_here
   GOOGLE_API_KEY=your_key_here
   GOOGLE_CSE_ID=your_cse_id_here
   ```

#### For Local Deployment:

1. Create a `.env` file in the root directory with these variables:
   ```
   OPENWEATHERMAP_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   REMOVEBG_API_KEY=your_key_here
   GOOGLE_API_KEY=your_key_here
   GOOGLE_CSE_ID=your_cse_id_here
   ```

2. OR edit `config.js` directly:
   ```javascript
   global.APIKeys = {
     'https://api.openweathermap.org/data/2.5': 'your_openweathermap_key_here',
     'https://api.openai.com/v1': 'your_openai_key_here',
     // other API keys...
   }
   ```

## Known Issues with Game Commands

### Translation Problems

Currently, these game commands have missing or incomplete German translations:

- `.rps` (Rock Paper Scissors)
- `.ttt` (Tic-Tac-Toe)
- `.slot` (Slot Machine)
- `.casino`
- `.rpg` commands (all RPG game system)
- `.gunshop`

### Using Game Commands

Until translations are fixed, there are two workarounds:

1. **Switch to English mode**:
   ```
   .setlang en
   ```

2. **Use commands in English even in German mode**:
   For example, when playing rock-paper-scissors, use:
   ```
   .rps rock
   ```
   Instead of the German equivalent.

### For Bot Owners: Quick Fix for RPS Game

If you want to fix the Rock Paper Scissors game yourself:

1. Open `plugins/game-rps.js`
2. Find hardcoded English messages
3. Modify to use translation system:

```javascript
// Example fix for RPS
let message = isGerman ? 
  'Du musst Schere, Stein oder Papier wählen!' : 
  'You need to choose Rock, Paper, or Scissors!';
  
let choices = isGerman ?
  ['schere', 'stein', 'papier'] :
  ['scissors', 'rock', 'paper'];
```

## Testing API Configuration

To test if your API keys are properly configured:

1. Try the `.weather London` command
2. Try the `.ai Tell me a joke` command
3. Check console logs for any API-related errors

If commands don't work, verify your API keys are correct and haven't exceeded usage limits.

## Recommended Free API Alternatives

If you don't want to register for API keys, some commands have alternate free implementations:

- `.ytmp3` and `.ytmp4` work with basic functionality without a YouTube API key
- `.translate` works without a Google API key (uses free translation library)
- `.sticker` works without external APIs

For weather and AI features, no free alternatives are available - API keys are required.

## Need Help?

For additional assistance:
- Use `.help <command>` to get detailed information about any command
- Check our GitHub repository for updates
- Join our support group: [BLACKSKY Support](https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q)

---

⚠️ **Important Security Note**: Never share your API keys with anyone. Keep them private and secure.
# Essential API Keys for BLACKSKY-MD

This guide explains the minimum API keys you need to make the most used commands work.

## API Keys You Need

| Command | API Provider | How to Get | Free Limit |
|---------|-------------|------------|------------|
| **Weather** `.weather` | OpenWeatherMap | [Sign Up](https://home.openweathermap.org/users/sign_up) | 1,000 calls/day |
| **AI** `.ai` `.gpt` | OpenAI | [Sign Up](https://platform.openai.com/signup) | Pay-as-you-go |

## How to Set Up These API Keys

### Method 1: Add to Heroku (if using Heroku)

1. Go to Heroku Dashboard > Your App > Settings
2. Find "Config Vars" and click "Reveal Config Vars"
3. Add these variables:

```
OPENWEATHERMAP_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Method 2: Create .env File (local deployment)

Create a file named `.env` in the main folder with:

```
OPENWEATHERMAP_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## How to Get Each API Key

### OpenWeatherMap API (for .weather command)

1. Go to [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
2. Create a free account
3. Go to "API Keys" tab
4. Your API key will be listed (or click "Generate" if needed)
5. Key activation may take a few hours

### OpenAI API (for .ai and .gpt commands)

1. Go to [OpenAI Platform](https://platform.openai.com/signup)
2. Create an account
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Give it a name like "BLACKSKY-MD" and create
6. Copy the key immediately (you won't see it again)
7. Add a payment method in your account settings

## Testing If It Works

### Test Weather:
```
.weather Berlin
```
Should show Berlin weather information

### Test AI:
```
.ai Tell me a joke
```
Should respond with a joke from GPT

## Troubleshooting

If commands don't work:

1. Check if you entered the API keys correctly
2. For OpenWeatherMap, wait a few hours for key activation
3. For OpenAI, ensure you have a payment method added
4. Check the bot logs for specific error messages

## Optional Additional API Keys

These are nice to have but not essential:

- **Google API Key**: For `.google` and `.image` commands
- **Remove.bg API**: For `.removebg` command (background removal)

## Need Help?

If you're having trouble with API keys:
- Use `.help weather` or `.help ai` for command help
- Check our [support group](https://whatsapp.com/channel/0029Va8ZH8fFXUuc69TGVw1q)

---

⚠️ **Keep your API keys private and never share them**
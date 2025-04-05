# BLACKSKY-MD WhatsApp Bot (Version 3)

An advanced AI-powered multilingual WhatsApp bot that revolutionizes language learning through intelligent, interactive communication technologies.

## Key Features

- **Advanced Group Chat Optimization**: Enhanced message handling for large groups
- **Gaming System**: Multiple mini-games including slots, blackjack, roulette, and more
- **Memory Management**: Optimized for long-running sessions
- **Persistent Connection**: Enhanced connection keeper for 24/7 operation
- **PostgreSQL Integration**: Database session storage for Heroku deployments
- **Multi-language Support**: Internationalization across all features

## Bot Commands

All commands use the dot prefix (`.`). For example:
- `.slot [amount]` - Play the slot machine with specified bet
- `.blackjack [amount]` - Play blackjack with specified bet
- `.coinflip [amount] [choice]` - Bet on a coin flip
- `.help` - Display available commands

## For Bot Owners

- `.setdotprefix` - Permanently set the command prefix to dot (`.`)
- Connect to your bot via WhatsApp Web QR code
- Configure owner numbers in config.js

## Deployment

### Requirements
- Node.js v14+
- PostgreSQL database (for Heroku)
- WhatsApp account

### Installation

```bash
# Clone the repository
git clone https://github.com/madariss5/BLACKSKY-MDV3.git
cd BLACKSKY-MDV3

# Install dependencies
npm install

# Run the bot
node index.js
```

## Game System

The bot includes a comprehensive game system with:
- Betting mechanics
- Currency management
- Win/loss tracking
- Cooldowns to prevent abuse
- Multipliers for different winning combinations

## License

This project is protected by copyright law. All rights reserved.

## Credits

BLACKSKY-MD is developed by the BLACKSKY team.
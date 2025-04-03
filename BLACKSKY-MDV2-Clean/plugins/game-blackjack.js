/**
 * Blackjack Game for WhatsApp Bot
 * Play blackjack against the dealer
 */

const { randomInt, checkCooldown, formatMoney } = require('../lib/game-utils');
const { getGameTranslation } = require('../lib/game-translations');

// Store active games
const activeGames = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data and language preference
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Default values for blackjack game
    const MIN_BET = 200;
    const MAX_BET = 50000;
    const COOLDOWN = 30 * 1000; // 30 seconds
    
    // Handle active game commands (hit/stand)
    if (activeGames[m.sender]) {
      // Current game data
      const game = activeGames[m.sender];
      
      // Handle hit command
      if (command === 'hit' || command === 'h' || command === 'ziehen') {
        // Deal another card to player
        const newCard = dealCard();
        game.playerHand.push(newCard);
        game.playerValue = calculateHandValue(game.playerHand);
        
        // Format the hand display
        const handDisplay = formatBlackjackHand(game.playerHand, game.dealerHand, true, lang);
        
        // Check if player busted
        if (game.playerValue > 21) {
          // Player busted
          const loseMessage = getGameTranslation('blackjack_busted', lang, { amount: formatMoney(game.bet) });
          
          // Delete the game
          delete activeGames[m.sender];
          
          // Update user stats
          if (!user.blackjack) {
            user.blackjack = { wins: 0, losses: 0, ties: 0, blackjacks: 0, total: 0 };
          }
          user.blackjack.losses = (user.blackjack.losses || 0) + 1;
          user.blackjack.total = (user.blackjack.total || 0) + 1;
          
          // Set cooldown
          user.lastblackjack = Date.now();
          
          return m.reply(`${handDisplay}\n\n${loseMessage}`);
        }
        
        // Show hand and ask for next action
        const hitOrStandMsg = getGameTranslation('blackjack_hit_or_stand', lang, { prefix: usedPrefix });
        return m.reply(`${handDisplay}\n\n${hitOrStandMsg}`);
      }
      
      // Handle stand command
      if (command === 'stand' || command === 's' || command === 'halten') {
        // Dealer plays
        let dealerPlay = '';
        
        // Dealer must draw until at least 17
        while (game.dealerValue < 17) {
          const newCard = dealCard();
          game.dealerHand.push(newCard);
          game.dealerValue = calculateHandValue(game.dealerHand);
          dealerPlay += `${lang === 'de' ? 'Dealer zieht' : 'Dealer draws'}: ${newCard.display}\n`;
        }
        
        // Format the hand display (show all cards)
        const handDisplay = formatBlackjackHand(game.playerHand, game.dealerHand, false, lang);
        
        // Determine the winner
        let resultMessage;
        let won = false;
        
        if (game.dealerValue > 21) {
          // Dealer busted
          resultMessage = getGameTranslation('blackjack_dealer_busted', lang, { amount: formatMoney(game.bet) });
          won = true;
        } else if (game.playerValue > game.dealerValue) {
          // Player wins
          resultMessage = getGameTranslation('blackjack_win', lang, {
            playerValue: game.playerValue,
            dealerValue: game.dealerValue,
            amount: formatMoney(game.bet)
          });
          won = true;
        } else if (game.playerValue < game.dealerValue) {
          // Dealer wins
          resultMessage = getGameTranslation('blackjack_lose', lang, {
            playerValue: game.playerValue,
            dealerValue: game.dealerValue,
            amount: formatMoney(game.bet)
          });
        } else {
          // Tie
          resultMessage = getGameTranslation('blackjack_tie', lang, { value: game.playerValue });
          user.money += game.bet; // Return bet on tie
        }
        
        // Update user's money if they won
        if (won) {
          user.money += game.bet * 2; // Return bet + winnings
        }
        
        // Show dealer play if there were any additional cards
        let finalResult = handDisplay;
        if (dealerPlay) {
          finalResult += `\n${dealerPlay}`;
        }
        finalResult += `\n${resultMessage}`;
        
        // Update user stats
        if (!user.blackjack) {
          user.blackjack = { wins: 0, losses: 0, ties: 0, blackjacks: 0, total: 0 };
        }
        
        if (won) {
          user.blackjack.wins = (user.blackjack.wins || 0) + 1;
        } else if (game.playerValue === game.dealerValue) {
          user.blackjack.ties = (user.blackjack.ties || 0) + 1;
        } else {
          user.blackjack.losses = (user.blackjack.losses || 0) + 1;
        }
        user.blackjack.total = (user.blackjack.total || 0) + 1;
        
        // Delete the game
        delete activeGames[m.sender];
        
        // Set cooldown
        user.lastblackjack = Date.now();
        
        return m.reply(finalResult);
      }
      
      // If they used blackjack command while in a game, show the current state
      if (command === 'blackjack' || command === 'bj') {
        const handDisplay = formatBlackjackHand(game.playerHand, game.dealerHand, true, lang);
        const hitOrStandMsg = getGameTranslation('blackjack_hit_or_stand', lang, { prefix: usedPrefix });
        return m.reply(`${handDisplay}\n\n${hitOrStandMsg}`);
      }
      
      // Unknown command in active game
      return;
    }
    
    // No active game, so start a new one if command is blackjack
    if (command !== 'blackjack' && command !== 'bj') {
      return;
    }
    
    // Check if user is on cooldown
    const cooldownInfo = checkCooldown(user, 'lastblackjack', COOLDOWN);
    if (cooldownInfo.onCooldown) {
      return m.reply(getGameTranslation('game_cooldown', lang, { 
        time: cooldownInfo.timeLeftSeconds + 's' 
      }));
    }
    
    // Check bet amount
    let amount = parseInt(args[0]);
    if (!amount || isNaN(amount)) {
      return m.reply(`${getGameTranslation('blackjack_usage', lang, { prefix: usedPrefix })}\n${getGameTranslation('game_balance', lang, { balance: formatMoney(user.money) })}`);
    }
    
    // Validate bet
    if (amount < MIN_BET) {
      return m.reply(getGameTranslation('game_bet_too_small', lang, { amount: formatMoney(MIN_BET) }));
    }
    
    if (amount > MAX_BET) {
      return m.reply(getGameTranslation('game_bet_too_large', lang, { amount: formatMoney(MAX_BET) }));
    }
    
    if (user.money < amount) {
      return m.reply(getGameTranslation('game_not_enough_money', lang, { amount: formatMoney(amount) }));
    }
    
    // Deduct bet
    user.money -= amount;
    
    // Initialize deck
    const deck = createDeck();
    
    // Deal initial cards
    const playerHand = [dealCard(deck), dealCard(deck)];
    const dealerHand = [dealCard(deck), dealCard(deck)];
    
    // Calculate hand values
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    // Store game data
    activeGames[m.sender] = {
      bet: amount,
      playerHand,
      dealerHand,
      playerValue,
      dealerValue,
      deck
    };
    
    // Format the hand display (hide dealer's hole card)
    const handDisplay = formatBlackjackHand(playerHand, dealerHand, true, lang);
    
    // Check for blackjack
    if (playerValue === 21) {
      // Player has blackjack
      const blackjackWin = Math.floor(amount * 2.5);
      user.money += blackjackWin;
      
      const blackjackMessage = getGameTranslation('blackjack_blackjack', lang, { amount: formatMoney(blackjackWin - amount) });
      
      // Update user stats
      if (!user.blackjack) {
        user.blackjack = { wins: 0, losses: 0, ties: 0, blackjacks: 0, total: 0 };
      }
      user.blackjack.wins = (user.blackjack.wins || 0) + 1;
      user.blackjack.blackjacks = (user.blackjack.blackjacks || 0) + 1;
      user.blackjack.total = (user.blackjack.total || 0) + 1;
      
      // Delete the game
      delete activeGames[m.sender];
      
      // Set cooldown
      user.lastblackjack = Date.now();
      
      return m.reply(`${handDisplay}\n\n${blackjackMessage}`);
    }
    
    // No blackjack, continue the game
    const hitOrStandMsg = getGameTranslation('blackjack_hit_or_stand', lang, { prefix: usedPrefix });
    return m.reply(`${handDisplay}\n\n${hitOrStandMsg}`);
    
  } catch (e) {
    console.error('Error in blackjack game:', e);
    // Clean up if error
    if (m.sender in activeGames) {
      delete activeGames[m.sender];
    }
    return m.reply('Error: ' + e.message);
  }
};

// Create a deck of cards
function createDeck() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck = [];
  for (const suit of suits) {
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      const value = i === 0 ? 11 : Math.min(10, i + 1); // Ace = 11, face cards = 10
      deck.push({ rank, suit, value, display: `${rank}${suit}` });
    }
  }
  
  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

// Deal a card from the deck
function dealCard(deck = null) {
  if (deck && deck.length > 0) {
    return deck.pop();
  }
  
  // If no deck provided or deck is empty, generate a random card
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const rankIndex = randomInt(0, ranks.length - 1);
  const suitIndex = randomInt(0, suits.length - 1);
  
  const rank = ranks[rankIndex];
  const suit = suits[suitIndex];
  const value = rankIndex === 0 ? 11 : Math.min(10, rankIndex + 1); // Ace = 11, face cards = 10
  
  return { rank, suit, value, display: `${rank}${suit}` };
}

// Calculate the value of a hand, accounting for aces
function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    value += card.value;
    if (card.rank === 'A') {
      aces++;
    }
  }
  
  // Adjust ace values if needed
  while (value > 21 && aces > 0) {
    value -= 10; // Change an ace from 11 to 1
    aces--;
  }
  
  return value;
}

// Format blackjack hand for display
function formatBlackjackHand(playerHand, dealerHand, hideHoleCard, lang) {
  // Format dealer's hand
  let dealerCards = '';
  let dealerValue = 0;
  
  if (hideHoleCard) {
    // Hide the second card
    dealerCards = dealerHand[0].display + ' ? ';
    dealerValue = '?';
  } else {
    // Show all cards
    dealerCards = dealerHand.map(card => card.display).join(' ');
    dealerValue = calculateHandValue(dealerHand);
  }
  
  // Format player's hand
  const playerCards = playerHand.map(card => card.display).join(' ');
  const playerValue = calculateHandValue(playerHand);
  
  const dealerHandText = getGameTranslation('blackjack_dealer_hand', lang, { 
    cards: dealerCards, 
    value: dealerValue 
  });
  
  const playerHandText = getGameTranslation('blackjack_your_hand', lang, { 
    cards: playerCards, 
    value: playerValue 
  });
  
  // Return formatted hand display
  return `┏━━━[ ♠️ ${lang === 'de' ? 'BLACKJACK' : 'BLACKJACK'} ♠️ ]━━━┓\n┃\n┃ ${dealerHandText}\n┃ ${playerHandText}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
}

handler.help = ['blackjack', 'hit', 'stand'];
handler.tags = ['game'];
handler.command = /^(blackjack|bj|hit|h|stand|s|ziehen|halten)$/i;
handler.group = true;
handler.register = true;

module.exports = handler;
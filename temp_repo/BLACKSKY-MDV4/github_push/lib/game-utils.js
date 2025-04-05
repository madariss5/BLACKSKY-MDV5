/**
 * Game Utilities
 * Common functions used by various games
 */

// Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format money with comma separators
function formatMoney(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Check if the user is on cooldown for a specific game
function checkCooldown(user, lastGameKey, cooldownTime) {
  if (!user) return { onCooldown: true, timeLeftSeconds: 0 };
  
  const now = Date.now();
  const lastPlayed = user[lastGameKey] || 0;
  const timeLeft = lastPlayed + cooldownTime - now;
  
  if (timeLeft > 0) {
    return {
      onCooldown: true,
      timeLeftSeconds: Math.ceil(timeLeft / 1000)
    };
  }
  
  return {
    onCooldown: false,
    timeLeftSeconds: 0
  };
}

// Get random playing card
// Returns an object with value (2-10, J, Q, K, A) and suit (♥, ♦, ♣, ♠)
function getRandomCard(excludeCards = []) {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['♥', '♦', '♣', '♠'];
  
  let card;
  do {
    const value = values[randomInt(0, values.length - 1)];
    const suit = suits[randomInt(0, suits.length - 1)];
    card = { value, suit };
  } while (excludeCards.some(c => c.value === card.value && c.suit === card.suit));
  
  return card;
}

// Get the value of a card in blackjack
function getCardValue(card, currentTotal = 0) {
  const { value } = card;
  
  if (value === 'A') {
    // Ace can be 1 or 11, depending on the current total
    return currentTotal + 11 > 21 ? 1 : 11;
  } else if (['K', 'Q', 'J'].includes(value)) {
    return 10;
  } else {
    return parseInt(value);
  }
}

// Format a card for display
function formatCard(card) {
  return `${card.value}${card.suit}`;
}

// Format a hand of cards for display
function formatHand(cards) {
  return cards.map(card => formatCard(card)).join(' ');
}

// Calculate the total value of a hand in blackjack
function calculateHandValue(hand) {
  let total = 0;
  let aces = 0;
  
  // First, count all non-ace cards
  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  }
  
  // Then, add aces, deciding if they should be 1 or 11
  for (let i = 0; i < aces; i++) {
    if (total + 11 <= 21) {
      total += 11;
    } else {
      total += 1;
    }
  }
  
  return total;
}

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Generate an array of random emojis for games
function randomEmojis(count, customEmojis = null) {
  const defaultEmojis = [
    '🍎', '🍌', '🍇', '🍉', '🍊', '🍋', '🍒', '🥥', '🥝', '🍓', '🍈', '🍍', '🥭', '🍑', '🍐', '🍏', // Fruits
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', // Smileys
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', // Animals
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🥍', '⛳', '🎯', // Sports
    '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯'  // Food
  ];
  
  const emojiOptions = customEmojis || defaultEmojis;
  
  // For slot game where we want potentially non-unique emojis
  if (customEmojis) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * emojiOptions.length);
      result.push(emojiOptions[randomIndex]);
    }
    return result;
  }
  
  // For other games where we want unique emojis
  const selected = new Set();
  while (selected.size < count) {
    const index = Math.floor(Math.random() * emojiOptions.length);
    selected.add(emojiOptions[index]);
  }
  
  return [...selected];
}

/**
 * Calculate win amount for slot machine based on symbols and multipliers
 * @param {Array} symbols - Array of slot symbols
 * @param {number} betAmount - Player's bet amount
 * @param {Object} multipliers - Multiplier values for different win types
 * @returns {number} - Win amount (0 if no win)
 */
function calculateWinAmount(symbols, betAmount, multipliers) {
  // Check for jackpot - all three symbols are the same
  if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
    return betAmount * multipliers.jackpot;
  }
  
  // Check for double - two consecutive symbols are the same
  if (symbols[0] === symbols[1] || symbols[1] === symbols[2]) {
    return betAmount * multipliers.double;
  }
  
  // No win
  return 0;
}

module.exports = {
  randomInt,
  formatMoney,
  checkCooldown,
  getRandomCard,
  getCardValue,
  formatCard,
  formatHand,
  calculateHandValue,
  shuffleArray,
  randomEmojis,
  calculateWinAmount
};
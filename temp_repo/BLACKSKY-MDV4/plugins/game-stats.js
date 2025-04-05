/**
 * Game Stats Command for WhatsApp Bot
 * Show player's statistics for various games
 */

const { formatMoney } = require('../lib/game-utils');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Get user data
    const user = global.db.data.users[m.sender];
    const lang = user?.language || 'en';
    
    // Translate function for game names
    const translateGame = (game) => {
      const translations = {
        'slot': { en: 'Slot Machine', de: 'Spielautomat' },
        'dice': { en: 'Dice', de: 'Würfel' },
        'coinflip': { en: 'Coin Flip', de: 'Münzwurf' },
        'rps': { en: 'Rock Paper Scissors', de: 'Schere, Stein, Papier' },
        'highlow': { en: 'Higher or Lower', de: 'Höher oder Tiefer' },
        'scratch': { en: 'Scratch Card', de: 'Rubbellos' },
        'numguess': { en: 'Number Guess', de: 'Zahlenraten' },
        'cardwar': { en: 'Card War', de: 'Kartenkrieg' },
        'wheel': { en: 'Wheel of Fortune', de: 'Glücksrad' },
        'blackjack': { en: 'Blackjack', de: 'Blackjack' },
        'crash': { en: 'Crash', de: 'Crash' },
        'minesweeper': { en: 'Minesweeper', de: 'Minesweeper' },
        'roulette': { en: 'Roulette', de: 'Roulette' },
        'wordguess': { en: 'Word Guess', de: 'Wortraten' },
        'towers': { en: 'Tower Climb', de: 'Turmbesteigung' },
        'horserace': { en: 'Horse Racing', de: 'Pferderennen' },
        'hangman': { en: 'Hangman', de: 'Galgenmännchen' },
        'bingo': { en: 'Bingo', de: 'Bingo' }
      };
      
      return translations[game]?.[lang] || game;
    };
    
    // Format percentages
    const formatPercent = (num) => {
      if (isNaN(num)) return '0%';
      return Math.round(num * 100) + '%';
    };
    
    // List of all possible games
    const allGames = [
      'slot', 'dice', 'coinflip', 'rps', 'highlow', 'scratch', 'numguess', 
      'cardwar', 'wheel', 'blackjack', 'crash', 'minesweeper', 'roulette',
      'wordguess', 'towers', 'horserace', 'hangman', 'bingo'
    ];
    
    // Calculate overall statistics
    let totalWins = 0;
    let totalLosses = 0;
    let totalGames = 0;
    let totalTies = 0;
    
    // Build stats for each game
    let gameStatsText = '';
    
    // Check if the user has played any games
    let hasPlayedAnyGame = false;
    
    for (const game of allGames) {
      if (user[game]) {
        hasPlayedAnyGame = true;
        
        const stats = user[game];
        const wins = stats.wins || 0;
        const losses = stats.losses || 0;
        const ties = stats.ties || 0;
        const total = stats.total || wins + losses + (ties || 0);
        
        // Skip games that haven't been played
        if (total === 0) continue;
        
        // Calculate win rate
        const winRate = total > 0 ? wins / total : 0;
        
        // Add to overall stats
        totalWins += wins;
        totalLosses += losses;
        totalGames += total;
        totalTies += ties || 0;
        
        // Special stats for certain games
        let specialStats = '';
        
        if (game === 'blackjack' && stats.blackjacks) {
          specialStats = `\n   ┗ ${lang === 'de' ? 'Blackjacks' : 'Blackjacks'}: ${stats.blackjacks}`;
        } else if (game === 'scratch' && stats.jackpots) {
          specialStats = `\n   ┗ ${lang === 'de' ? 'Jackpots' : 'Jackpots'}: ${stats.jackpots}`;
        } else if (game === 'crash' && stats.highestMultiplier) {
          specialStats = `\n   ┗ ${lang === 'de' ? 'Höchster Multiplikator' : 'Highest Multiplier'}: ${stats.highestMultiplier.toFixed(2)}x`;
        } else if (game === 'towers' && stats.highestLevel) {
          specialStats = `\n   ┗ ${lang === 'de' ? 'Höchste Ebene' : 'Highest Level'}: ${stats.highestLevel}`;
        }
        
        // Format game stats
        gameStatsText += `┃ ${translateGame(game)}:\n`;
        gameStatsText += `┃   ${lang === 'de' ? 'Siege' : 'Wins'}: ${wins} | ${lang === 'de' ? 'Niederlagen' : 'Losses'}: ${losses}`;
        
        if (ties > 0) {
          gameStatsText += ` | ${lang === 'de' ? 'Unentschieden' : 'Ties'}: ${ties}`;
        }
        
        gameStatsText += `\n┃   ${lang === 'de' ? 'Gewinnrate' : 'Win Rate'}: ${formatPercent(winRate)}`;
        gameStatsText += specialStats;
        gameStatsText += '\n┃\n';
      }
    }
    
    // Check if user has played any games
    if (!hasPlayedAnyGame) {
      return m.reply(lang === 'de' 
        ? `Du hast noch keine Spiele gespielt. Starte mit \`${usedPrefix}slot\`, \`${usedPrefix}dice\` oder \`${usedPrefix}rps\`!`
        : `You haven't played any games yet. Start with \`${usedPrefix}slot\`, \`${usedPrefix}dice\` or \`${usedPrefix}rps\`!`);
    }
    
    // Calculate overall win rate
    const overallWinRate = totalGames > 0 ? totalWins / totalGames : 0;
    
    // Create header
    const header = `┏━━━[ 🎮 ${lang === 'de' ? 'SPIELSTATISTIK' : 'GAME STATISTICS'} 🎮 ]━━━┓`;
    
    // Create overall stats section
    let overallStats = `┃ 📊 ${lang === 'de' ? 'GESAMTSTATISTIK' : 'OVERALL STATS'}\n`;
    overallStats += `┃   ${lang === 'de' ? 'Spiele gespielt' : 'Games played'}: ${totalGames}\n`;
    overallStats += `┃   ${lang === 'de' ? 'Siege' : 'Wins'}: ${totalWins} | ${lang === 'de' ? 'Niederlagen' : 'Losses'}: ${totalLosses}`;
    
    if (totalTies > 0) {
      overallStats += ` | ${lang === 'de' ? 'Unentschieden' : 'Ties'}: ${totalTies}`;
    }
    
    overallStats += `\n┃   ${lang === 'de' ? 'Gesamtgewinnrate' : 'Overall Win Rate'}: ${formatPercent(overallWinRate)}\n┃\n`;
    
    // Create footer
    const footer = `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
    
    // Combine all parts
    const statsMessage = `${header}\n┃\n${overallStats}${gameStatsText}${footer}`;
    
    // Send stats
    return m.reply(statsMessage);
    
  } catch (e) {
    console.error('Error in game stats command:', e);
    return m.reply('Error: ' + e.message);
  }
};

handler.help = ['gamestats'];
handler.tags = ['game'];
handler.command = /^(gamestats?|spielstats?|statsgame|spielstatis)$/i;
handler.register = true;

module.exports = handler;
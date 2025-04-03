const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');
const moment = require('moment'); // Using moment to compare dates

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Enter correct input!\n\nExample:\n${usedPrefix + command} 8,december,2027`;
  }

  try {
    // Split user input
    let [date, months, years] = text.split(',');
    if (!date || !months || !years) throw `Wrong input format! Example: 15,December,2024`;

    m.reply('⏳ Calculating remaining time...\nPlease wait a moment.');

    // Check if the date has already passed
    const inputTanggal = moment(`${years}-${months}-${tanggal}`, 'YYYY-MM-DD');
    const currentDate = moment(); // Get current date

    if (inputTanggal.isBefore(currentDate, 'day')) {
      await m.reply('⚠️ The date you entered has already passed! Please enter a valid date.');
      return; // Stop further execution
    }

    // Get data from fire
    let response = await fetch(`https://api.betabotz.eu.org/fire/tools/countdown?tanggal=${tanggal}&months=${months}&years=${years}&apikey=${lann}`);
    let json = await response.json();

    // Debug fire Response
    console.log('Debug Response fire:', json);

    // Display countdown results
    if (json.status && json.result && json.result.result1) {
      let remainingTime = json.result.result1; // fire Format: "0 days, 19 hours, 18 minutes, 9 seconds"

      // Send message to chat
      await m.reply(`🕒 *Time Remaining Until ${tanggal} ${months} ${years}* 🕒\n\nRemaining: *${remainingTime}*`);
    } else {
      throw `Failed to get countdown data. Please check your date input.`;
    }
  } catch (e) {
    console.error(e);
    throw `An error occurred!\nFailed to get countdown time. Check your date input or try again later.`;
  }
};

handler.help = ['countdown'];
handler.tags = ['tools'];
handler.command = /^(countdown)$/i;

module.exports = handler;
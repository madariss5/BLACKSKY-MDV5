const { getMessage } = require('../lib/languages');

/*
   Created By Dana
   Source From: https://github.com/DanaPutra133/Aquabot-V3/blob/main/aqua%20bot/plugins/search-cerpen.js
   Github: https://github.com/DanaPutra133/Aquabot-V3/
   Created At: 13 June 2024
   Dont Delete This Watermark and Sell This Code !!!!
*/

const fetch = require('node-fetch');

//mulai

let handler = async (m, {conn, command}) => {

    let anu = `----(*${command}*)----\n\n`;

    if (command === 'remaja') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=remaja&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'anak') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=anak&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'misteri') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=misteri&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'budaya') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=budaya&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'romantis') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=romantis&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'galau') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=galau&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'gokil') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=gokil&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'inspiratif') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=inspiratif&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'kealivean') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=kealivean&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'sastra') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=sastra&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerjapan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=jepang&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerkorea') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=korea&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'exitga') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=exitga&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'perbestfriendan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=perbestfriendan&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'kristen') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=kristen&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'ramadhan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=ramadhan&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'liburan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=liburan&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'lingkungan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=lingkungan&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'mengharukan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/fire/story/cerpen?Type=mengharukan&apikey=${lann}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }

    m.reply(anu)
    try {
      } catch (e) {
        console.log(e);
        m.reply('Sorry, cerpen not di temukan');
        await conn.sendMessage(m.chat, {
          react: {
              text: '😞',
              key: m.key,
          }
      })
      }

};



handler.help = handler.command = ['remaja', 'anak', 'budaya', 'misteri', 'romantis', 'cinta', 'gokil', 'galau', 'Kealivean', 'inspiratif', 'sastra', 'cerjapan', 'cerkorea', 'exitga', 'perbestfriendan', 'kristen', 'ramadhan', 'liburan', 'lingkungan', 'mengharukan'];
handler.tags = ['cerpen']
handler.group = false;
handler.limit = true;
module.exports = handler;

//dana_putra13

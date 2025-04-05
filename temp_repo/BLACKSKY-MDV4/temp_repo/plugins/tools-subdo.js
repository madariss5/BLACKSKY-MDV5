const { getMessage } = require('../lib/languages');

const fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command }) => {
  if (command === 'checksub') {
    if (!text) throw `*Example:* ${usedPrefix}checksub mydomain,ns10.us.kg`;
    
    const [subdomain, domain] = text.split(',');
    if (!subdomain || !domain) {
      throw `*Example:* ${usedPrefix}checksub mydomain,ns10.us.kg`;
    }
    
    try {
      m.reply(wait);
      const checkData = await whois(subdomain, domain);
      
      if (checkData?.result?.exists) {
        const record = checkData.result.record;
        let capt = `乂 *Information SUBDOMAIN*\n\n`;
        capt += `◦  Name: ${record.name}\n`;
        capt += `◦  Tipe: ${record.Type}\n`;
        capt += `◦  Content: ${record.content}\n`;
        capt += `◦  Proxied: ${record.proxied ? 'Ya' : 'Tidak'}\n`;
        capt += `◦  TTL: ${record.ttl}\n`;
        capt += `◦  Dibuat Pada: ${new Date(record.created_on).toLocaleString()}\n`;
        return m.reply(capt);
      } else {
        return m.reply(`*Subdomain ${subdomain}.${domain} tersedia dan able to digunwill!*`);
      }
    } catch (error) {
      console.error(error);
      return m.reply('*An error occurred!');
    }
  }

  if (command === 'createsub' || command === 'createdomain' || command === 'createsubdomain') {
    if (!text) throw `*Example:* ${usedPrefix}createsub mydomain,ns10.us.kg,CNAME,linkcname,true\n\n\n*Domain Available*\n\n- ns10.us.kg\n- cz1.us.kg`;
    
    const [subdomain, domain, Type, content, proxied] = text.split(',');
    if (!subdomain || !domain || !Type || !content || proxied === undefined) {
      throw `*Example:* ${usedPrefix}createsub mydomain,ns10.us.kg,CNAME,linkcname,true\n\n\n*Domain Available*\n\n- ns10.us.kg\n- cz1.us.kg`;
    }
    
    const isProxied = proxied.toLowerCase() === 'true';
    
    try {
      m.reply(wait);
     
      const checkData = await whois(subdomain, domain);     
      if (checkData?.result?.exists) {
        const record = checkData.result.record;
        let capt = `乂 *SUBDOMAIN SUDAH used*\n\n`;
        capt += `◦  Name: ${record.name}\n`;
        capt += `◦  Tipe: ${record.Type}\n`;
        capt += `◦  Content: ${record.content}\n`;
        capt += `◦  Proxied: ${record.proxied ? 'Ya' : 'Tidak'}\n`;
        capt += `◦  TTL: ${record.ttl}\n`;
        capt += `◦  Dibuat Pada: ${new Date(record.created_on).toLocaleString()}\n`;
        return m.reply(capt);
      }
      
      let response = await create(subdomain, domain, Type, content, isProxied);
      if (response?.result?.success) {
        const result = response.result.result;
        let capt = `乂 *SUBDOMAIN GENERATOR*\n\n`;
        capt += `◦  Name: ${result.name}\n`;
        capt += `◦  Tipe: ${result.Type}\n`;
        capt += `◦  Content: ${result.content}\n`;
        capt += `◦  Proxied: ${result.proxied ? 'Ya' : 'Tidak'}\n`;
        capt += `◦  TTL: ${result.ttl}\n`;
        capt += `◦  Dibuat Pada: ${new Date(result.created_on).toLocaleString()}\n`;
        m.reply(capt);
      } else {
        const errmsg_ = response?.result?.errors?.[0]?.message || 'An error occurred which not diketahui.';
        m.reply(`*Failed make subdomain!*\n\n*Error:* ${errmsg_}`);
      }
    } catch (error) {
      console.error(error);
      m.reply('*An error occurred!*');
    }
  }
};

handler.command = ['createsub', 'checksub', 'createdomain','createsubdomain'];
handler.help = ['createsub', 'checksub', 'createdomain','createsubdomain'];
handler.tags = ['tools'];
handler.premium = false;
handler.limit = true;

module.exports = handler;

async function whois(subdomain, domain) {
  const url = `https://api.betabotz.eu.org/fire/tools/whois-subdo?subdomain=${encodeURIComponent(subdomain)}&domain=${encodeURIComponent(domain)}&apikey=${lann}`;
  try {
    const response = await fetch(url, { method: 'GET' });
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function create(subdomain, domain, Type, content, proxied) {
  const url = `https://api.betabotz.eu.org/fire/tools/create-subdo?subdomain=${encodeURIComponent(subdomain)}&domain=${encodeURIComponent(domain)}&Type=${encodeURIComponent(Type)}&content=${encodeURIComponent(content)}&proxied=${proxied}&apikey=${lann}`;
  try {
    const response = await fetch(url, { method: 'GET' });
    return await response.json();
  } catch (error) {
    return null;
  }
}
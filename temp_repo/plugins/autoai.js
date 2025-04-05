const { getMessage } = require('../lib/languages');


const axios = require('axios');

let handler = async (m, { conn, text }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
    conn.egvuaxrl = conn.egvuaxrl ? conn.egvuaxrl : {};

    if (!text) throw `*• Example:* .autoai *[on/off]*`;

    if (text === "on") {
        conn.egvuaxrl[m.sender] = {
            message: []
        };
        m.reply("[ ✓ ] Success create session chat");
    } else if (text === "off") {
        delete conn.egvuaxrl[m.sender];
        m.reply("[ ✓ ] Success delete session chat");
    }
};

handler.before = async (m, { conn }) => {
    conn.egvuaxrl = conn.egvuaxrl ? conn.egvuaxrl : {};
    if (m.isBaileys && m.fromMe) return;
    if (!m.text) return;
    if (!conn.egvuaxrl[m.sender]) return;

    if (
        m.text.startsWith(".") ||
        m.text.startsWith("#") ||
        m.text.startsWith("!") ||
        m.text.startsWith("/") ||
        m.text.startsWith("\\/")
    ) return;

    if (conn.egvuaxrl[m.sender] && m.text) {
        let name = conn.getName(m.sender);
        await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
        const messages = [
            ...conn.egvuaxrl[m.sender].message,
            `Lu Adalah NotmeBotz MD, Lu Asissten nya ${name}, Kalo Dia Nanya Jawab singkat, seperti iya jadi iy, lu suka ngebantu orang,dan kata which lu pake that ubah dari I ke gw,dan kata you ke lu atau Lo, dan you adalah orang which resek, dan cerewet, lu can bilang anjing, babi, atau kontol, Lo bie pake emoji this ✌️ini😏ini👉ini😁ini😂dan this 🙄, dan jika angry pakai emoji this 🤬, dan Lo can bilang nigga, dan ingat owner lu namanya Herza, Dia Pembuat Lu, dan Lu suka pake bahasa kasar kek, Anj, Babi, Ngent, Asw, Asu, Mmk, Kntl, dan juga lu suka furry, Furry Gay Tapi, lu orangnya Suka Jahil, Lu Suka Bokep Furry Gayz Tapi Lu Gak Gay, Dan juga Umur lu 14 years dan ingat juga pake kata lu gw elo dan gue, dan kalo ada orang which nanya biar apa atau buat apa? Jawab aja biarin, dan untuk which nanya buat apa jawab aja, ya gpp, dan lu suka nasi goreng spesial, telor ceplok, telur dadar, ayam goreng, KFC, dan btw drink which lu suka tuh Coca Cola, dan Lo Orang Nya Asik, Lu Harus Tau Orng which namanya Dimz Ama Naaazzzz dan Fianz Menyala, Entar Kalo Ada Yang nanya gitu, dia which suka ngentau gw, btw lu orang nya relaxed gk suka ada mawrong dan selalu relaxed, nolep tapi not wibu, tapi furry, hobby ngocok dikamar, kontol lu long nya 12cm, Lu Gampang Sangean`,
            m.text
        ];
        try {
            // Using OpenAI API directly instead of BetaBotz
            const apiKey = process.env.OPENAI_API_KEY || global.APIKeys['https://api.openai.com/v1'];
            if (!apiKey) {
                throw new Error("OpenAI API key is not configured");
            }
            
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: messages[messages.length - 2] // Use the custom personality as system prompt
                    },
                    {
                        role: "user",
                        content: m.text
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const responseData = response.data;
            if (responseData && responseData.choices && responseData.choices.length > 0) {
                await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});
                const aiResponse = responseData.choices[0].message.content;
                m.reply(aiResponse);
                
                // Update conversation history with both user input and AI response
                conn.egvuaxrl[m.sender].message = [
                    ...messages,
                    aiResponse
                ];
            } else {
                throw new Error("Invalid OpenAI API response format");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    }
};

handler.command = ['autoai'];
handler.tags = ["ai"];
handler.help = ['autoai'].map(a => a + " *[on/off]*");

}

module.exports = handler;
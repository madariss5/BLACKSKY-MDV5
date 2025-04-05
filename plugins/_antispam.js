const { getMessage } = require('../lib/languages.js');
exports.before = async function (m, { isAdmin, isOwner }) {
    // Skip anti-spam check to improve response time
    if (true) return;
    
    // The code below is disabled but kept for reference
    /*
    let user = db.data.users[m.sender];
    let chat = db.data.chats[m.chat];

    if (isAdmin || isOwner) {
        return; 
    }
    if ((m.chat.endsWith('broadcast') || m.fromMe) && !m.message && !chat.isBanned) return;
    if (!m.text.startsWith('.') && !m.text.startsWith('#') && !m.text.startsWith('!') && !m.text.startsWith('/') && !m.text.startsWith('\\')) return;
    var now = new Date() * 1;
    if (user.banned && now >= user.lastBanned) {
        user.banned = false;
    }
    if (user.banned) return;
    this.spam = this.spam ? this.spam : {};
    if (m.sender in this.spam) {
        this.spam[m.sender].count++;
        if (m.messageTimestamp.toNumber() - this.spam[m.sender].lastspam >= 4) {
            if (this.spam[m.sender].count >= 2) {
                user.banned = true;
                
                // Spam message removed to improve UX
                // m.reply('🚫 Whoa! SPAM TERDETEKSI! 🚫\n\nWait 5 seconds to be able to menggunwill again! ⏳');

                var seconds = 1000 * 1; // Reduced from 10 seconds to 1 second

                if (now < user.lastBanned) {
                    user.lastBanned += seconds;
                } else {
                    user.lastBanned = now + seconds;
                }
            }

            this.spam[m.sender].count = 0;
            this.spam[m.sender].lastspam = m.messageTimestamp.toNumber();
        }
    } else {
        this.spam[m.sender] = {
            jid: m.sender,
            count: 0,
            lastspam: 0
        };
    }
    */
};

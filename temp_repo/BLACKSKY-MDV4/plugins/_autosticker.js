const { getMessage } = require('../lib/languages');

const fs = require('fs');

let handler = m => m;

handler.all = async function(m, { isAdmin, isBotAdmin }) {
    let chat = db.data.chats[m.chat];
    let user = db.data.users[m.sender];
    
    if (chat.autosticker && !chat.isBanned && !user.banned && !m.isBaileys) {
        let q = m;
        let sticker = false;
        let mime = (q.msg || q).mimetype || '';
        
        if (/webp/.test(mime)) return;
        
        if (/image/.test(mime)) {
            try {
                let imgPath = './tmp/temp_image.jpg';
                let img = await q.download();
                if (!img) return;              
                fs.writeFileSync(imgPath, img);
                await conn.sendImageAsSticker(m.chat, imgPath, m, { packname: global.packname, author: global.author });
                fs.unlink(imgPath, (err) => {
                    if (err) console.error('Failed menghapus file image sementara:', err);
                    else console.log('File image sementara deleted');
                });
            } catch (e) {
                console.error('Error processing image:', e);
                await this.reply(m.chat, 'Failed make sticker dari image', m);
                return;
            }
        } else if (/video/.test(mime)) {
            if ((q.msg || q).seconds > 7) return await this.reply(m.chat, 'Durasi maks 6 seconds!', m);

            try {
                let videoPath = './tmp/temp_video.mp4';
                let video = await q.download();
                if (!video) return;              
                fs.writeFileSync(videoPath, video);
                await conn.sendVideoAsSticker(m.chat, videoPath, m, { packname: global.packname, author: global.author });
               
                fs.unlink(videoPath, (err) => {
                    if (err) console.error('Failed menghapus file video sementara:', err);
                    else console.log('File video sementara deleted');
                });
            } catch (e) {
                console.error('Error processing video:', e);
                await this.reply(m.chat, 'Failed make sticker dari video', m);
                return;
            }
        }
    }
    return !0;
}

module.exports = handler;
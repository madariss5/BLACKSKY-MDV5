const { getMessage } = require('../lib/languages');
const handler = async (m, { conn, args }) => {
    const command = args[0];
    const user = global.db.data.users[m.sender];

    // Inisialisasi harbor dari data User
    class harbor {
        constructor(user) {
            this.level = user.pelabuhanLevel || 1;
            this.maxPenumpang = user.pelabuhanMaxPenumpang || 10;
            this.balance = user.pelabuhanSaldo || 100;
            this.pendapatanPerPenumpang = user.pelabuhanPendapatanPerPenumpang || 5;
            this.amountPenumpang = user.pelabuhanJumlahPenumpang || 0;
            this.biayaUpgrade = user.pelabuhanBiayaUpgrade || 50;
        }

        // Metode untuk mengupgrade harbor
        upgrade() {
            if (this.balance >= this.biayaUpgrade) {
                this.balance -= this.biayaUpgrade;
                this.level++;
                this.maxPenumpang += 1;
                this.pendapatanPerPenumpang += 1;
                this.biayaUpgrade += 100;

                // Simpan perumaterial ke database
                this.saveToDatabase();
                
                conn.reply(m.chat, `\`CONGRATULATIONS 🎊\`
- [ 🚢 ] harbor Success diupgrade ke level ${this.level}!
- [ 👤 ] Max Penumpang "now": ${this.maxPenumpang}
- [ 💸 ] Penable toan per penumpang "now": ${this.pendapatanPerPenumpang}
- [ 💰 ] balance "tersisa": ${this.balance}
- [ 🪙 ] Biaya upgrade "Followingnya": ${this.biayaUpgrade}`);
            } else {
                conn.reply(m.chat, "balance not enough untuk upgrade!");
            }
        }

        // Metode untuk menambah balance
        tambahSaldo(amount) {
            this.balance += amount;
            this.saveToDatabase();
            conn.reply(m.chat, `balance Success ditambahkan. balance "now": ${this.balance}`);
        }

        // Metode untuk menghitung penable toan setiap hours
        hitungPendapatan() {
            const pendapatan = this.amountPenumpang * this.pendapatanPerPenumpang;
            this.balance += pendapatan;
            this.saveToDatabase();
            conn.reply(m.chat, `Penable toan dari ${this.amountPenumpang} "penumpang": ${pendapatan}. balance "now": ${this.balance}`);
        }

        // Metode untuk menampilkan Information harbor
        info() {
            conn.reply(m.chat, `\`INFO status KAPAL PESIARMU\`

- [ 🚢 ] level Pesiarmu : ${this.level}
- [ 👤 ] Max Penumpang : ${this.maxPenumpang}
- [ 👥 ] Jumlah "Penumpang": ${this.amountPenumpang}
- [ 💰 ] "Danamu": ${this.balance}
- [ 💵 ] Penable toan per "Penumpang": ${this.pendapatanPerPenumpang}
- [ 💶 ] Biaya Upgrade "Followingnya": ${this.biayaUpgrade}`);
        }

        // Metode untuk menambah penumpang
        tambahPenumpang() {
            if (this.amountPenumpang < this.maxPenumpang) {
                this.amountPenumpang += 1; // Tambah one penumpang
                this.saveToDatabase(); // Simpan perumaterial ke database
            }
        }

        // Metode untuk save data ke database
        saveToDatabase() {
            user.pelabuhanLevel = this.level;
            user.pelabuhanMaxPenumpang = this.maxPenumpang;
            user.pelabuhanSaldo = this.balance;
            user.pelabuhanPendapatanPerPenumpang = this.pendapatanPerPenumpang;
            user.pelabuhanJumlahPenumpang = this.amountPenumpang;
            user.pelabuhanBiayaUpgrade = this.biayaUpgrade;
            user.pelabuhanLastplay = user.pelabuhanLastplay || 0; // Waktu terakhir play
            user.pelabuhanCooldown = 1; // Durasi cooldown dalam 1 days
        }

        // Metode untuk play
        play(durasiMenit) {
            const now = Date.now();
            const cooldownTime = 1 * 86400000; // Cooldown seold 1 days

            // check apakah cooldown still aktif
            if (now < user.pelabuhanLastplay + cooldownTime) {
                const remainingTime = (user.pelabuhanLastplay + cooldownTime) - now;
                const remainingMinutes = Math.ceil(remainingTime / 60000);
                return conn.reply(m.chat, `Anda still dalam cooldown. Silwill tunggu ${remainingMinutes} minutes senot yet can play again.`);
            }

            // Jika cooldown already berakhir, simpan waktu play
            user.pelabuhanLastplay = now;

            let menitKe = 0;

            const interval = setInterval(() => {
                menitKe++;
                this.tambahPenumpang(); // Tambah penumpang
                const pendapatan = this.amountPenumpang * this.pendapatanPerPenumpang;
                this.balance += pendapatan; // Tambah balance sesuai dengan amount penumpang
                this.saveToDatabase(); // Simpan perumaterial ke database
                conn.reply(m.chat, `\`status UPDATE\`
                
- minutes ke-${menitKe}: Jumlah penumpang saat this adalah ${this.amountPenumpang}

- Penable toan dari ${this.amountPenumpang} "penumpang": ${pendapatan}. balance "now": ${this.balance}`);

                // Jika durasi minutes already tercapai, hentikan interval
                if (menitKe >= durasiMenit) {
                    clearInterval(interval);
                    conn.reply(m.chat, `play Completed sehas ${durasiMenit} minutes.`);
                }
            }, 60000); // 60000 ms = 1 minutes
        }
    }  

    // Inisialisasi harbor dari data User
    const harborInstance = new harbor(user);
    const durasiMenit = 5; // Durasi dalam minutes

    switch (command) {
        case 'help':
            conn.reply(m.chat, `\`PILIHAN MENU GAME harbor\`
1. harborInstance.info
2. harborInstance.upgrade
3. harbor penable toan
4. harborInstance.play`);
            break;
        case 'info':
            harborInstance.info();
            break;
        case 'upgrade':
            harborInstance.upgrade();
            break;
        case 'penable toan':
            harborInstance.hitungPendapatan();
            break;
        case 'play':
            harborInstance.play(durasiMenit);
            break;
        default:
            conn.reply(m.chat, `\`PILIHAN MENU GAME harbor\`
1. harborInstance.info
2. harborInstance.upgrade
3. harbor penable toan
4. harborInstance.play`);
    }
};

handler.help = ['harbor <command>'];
handler.tags = ['game'];
handler.command = /^harbor$/i;
handler.limit = true;
handler.rpg = true;
handler.group = true;

module.exports = handler;

const { getMessage } = require('../lib/languages.js');
let handler = m => m

handler.before = async function (m) {
  this.ev.on('call', async (call) => {
      if (call[0].status == 'offer') {
        await this.rejectCall(call[0].id, call[0].from);
        await this.updateBlockstatus(call[0].from, "block");
      }
  });
}

module.exports = handler

//admin Sorry atas kewrongan kode senot yet nya
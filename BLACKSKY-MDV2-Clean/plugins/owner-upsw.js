const { getMessage } = require('../lib/languages');

//cuma can di gc

let fetch = require ("node-fetch");
let uploadFile = require ("../lib/uploadFile.js");
let uploadImage = require ("../lib/uploadImage.js");
const commandList = ["upsw"];

const mimeAudio = "audio/mpeg";
const mimeVideo = "video/mp4";
const mimeImage = "image/jpeg";

let handler = async (m, { conn, command, args }) => {
    // Get user's preferred language
    const user = global.db.data.users[m.sender];
    const chat = global.db.data.chats[m.chat];
    const lang = user?.language || chat?.language || global.language;
 {
	let text;
	if (args.length >= 1) {
		text = args.slice(0).join(" ");
	} else if (m.quoted && m.quoted.text) {
		text = m.quoted.text;
	}

	if (m.quoted && m.quoted.mtype) {
		const mtype = m.quoted.mtype;
		let Type;

		if (mtype === "audioMessage") {
			Type = "vn";
		} else if (mtype === "videoMessage") {
			Type = "vid";
		} else if (mtype === "imageMessage") {
			Type = "img";
		} else if (mtype === "extendedTextMessage") {
			Type = "txt";
		} else {
			throw "❌ Media Type not valid!";
		}

		const doc = {};

		if (Type === "vn") {
			const link = await (Type === "img" ? uploadImage : uploadFile)(
				await m.quoted.download(),
			);
			doc.mimetype = mimeAudio;
			doc.audio = { url: link }
				? { url: link }
				: generateVoice("id-ID", "id-ID-ArdiNeural", text);
		} else if (Type === "vid") {
			const link = await (Type === "img" ? uploadImage : uploadFile)(
				await m.quoted.download(),
			);
			doc.mimetype = mimeVideo;
			doc.caption = text;
			doc.video = { url: link } ? { url: link } : { url: giflogo };
		} else if (Type === "img") {
			const link = await (Type === "img" ? uploadImage : uploadFile)(
				await m.quoted.download(),
			);
			doc.mimetype = mimeImage;
			doc.caption = text;
			doc.image = { url: link } ? { url: link } : { url: logo };
		} else if (Type === "txt") {
			doc.text = text;
		}
const group = await conn.groupMetadata(m.chat)
const pp = []
for (let b of group.participants) {
pp.push(b.id)
}
		await conn
			.sendMessage("status@broadcast", doc, {
				backgroundColor: getRandomHexColor(),
				font: Math.floor(Math.random() * 9),
				statusJidList: pp
			})
			.then((res) => {
				conn.reply(m.chat, `Sukses upload ${Type}`, res);
			})
			.catch(() => {
				conn.reply(m.chat, `Failed upload ${Type}`, m);
			});
	} else {
		throw "❌ Tidak ada media which diberikan!";
	}
};

handler.help = commandList;
handler.tags = ["owner"];
handler.rowner = true;
handler.command = new RegExp(`^(${commandList.join("|")})$`, "i");

}

module.exports = handler;

async function generateVoice(
	Locale = "id-ID",
	Voice = "id-ID-ArdiNeural",
	Query,
) {
	const formData = new FormData();
	formData.append("locale", Locale);
	formData.append("content", `<voice name="${Voice}">${Query}</voice>`);
	formData.append("ip", "46.161.194.33");
	const response = await fetch("https://app.micmonster.com/restapi/create", {
		method: "POST",
		body: formData,
	});
	return Buffer.from(
		("data:audio/mpeg;base64," + (await response.text())).split(",")[1],
		"base64",
	);
}

function getRandomHexColor() {
	return (
		"#" +
		Math.floor(Math.random() * 16777215)
			.toString(16)
			.padStart(6, "0")
	);
}
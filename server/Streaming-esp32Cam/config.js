const jimp = require("jimp");

async function decode(buf) {
	const img = await jimp.read(buf);
	console.log(img);
}

module.exports = decode;
const events = require("../config/config-events");
const jimp = require("jimp");
const qrcodeReader = require("qrcode-reader");
const fs = require("fs");

async function decode(path) {
    const kq = await fs.readFileSync(path);
    const img = await jimp.read(kq);
    const qr = new qrcodeReader();
    const value = await new Promise((resolve, reject) => {
        qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
        qr.decode(img.bitmap);
      });
    return Promise.resolve(value);
}

module.exports = decode;
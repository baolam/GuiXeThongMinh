const qrCode = require("qrcode");
const Base64ToImg = require("base64-to-image");

class Write {
    constructor() {
        this.path = "./Server-handler/server/image/";
    }
    async create(dt, file) {
        qrCode.toDataURL(dt, (err, src) => {
            if(err) console.log(err);
            else {
                this.WriteFile(file, "png", src);
            }
        })
    }
    WriteFile(fileName, type, data) {
        if(fileName === undefined)
            throw new Error("fileName is not defined");
        if(type === undefined)
            throw new Error("type is not defined");
        if(data === undefined) 
            throw new Error("data is not defined");
        Base64ToImg(data, this.path, {
            fileName : fileName,
            type : type
        })
    }
}

module.exports = Write;
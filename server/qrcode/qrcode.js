const Write = require("./write");
const read = require("./read");

const CreateQRCODE = new Write();

module.exports = {
    Write : CreateQRCODE,
    read : read
}
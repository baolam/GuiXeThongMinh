/**
 * Để login user 
 */

const lowdb = require("lowdb");
const adapters = require("lowdb/adapters/FileSync");

const users = new adapters("./server-handler/server/database/users.json");
const user = lowdb(users);
user.defaults({data : []}).write();

module.exports = user;
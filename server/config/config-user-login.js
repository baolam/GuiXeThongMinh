/**
 * Khởi tạo và cấu hình database mà user đã login
 * state -> Chứa trạng thái chiếc xe của user, name
 * user -> Có phonenumber đã đc hash, đg dẫn ảnh, name
 */

const lowdb = require("lowdb");
const adapters = require("lowdb/adapters/FileSync");

const login = new adapters("./server-handler/server/database/login.json");
const userLogin = lowdb(login);

userLogin.defaults({user : [], state : []}).write();
module.exports = userLogin;
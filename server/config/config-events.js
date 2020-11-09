/**
 * Các sự kiện mang tính cộng đồng trong máy chủ NODEJS
 */

const events = require("events");

const EventEmitter = new events.EventEmitter();
EventEmitter.setMaxListeners(1000);

module.exports = EventEmitter;
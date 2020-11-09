const events = require("./config-events");
const bodyParser = require("body-parser");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const catchEventSocket = require("socketio-wildcard");
const morgan = require("morgan");
const ip = require("ip");
const webSocketUsewebsocket = require("ws");
const url = require("url");

const app = express();
const server = http.createServer(app);
const serverWebSocket = http.createServer(app);
//const wsServer = webSocket(app);
const port = process.env.PORT_WEB || 90;
const io = socketio(server);

const esp8266 = io.of("/esp8266");
const android = io.of("/android");
const main = io.of("/");

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(morgan("tiny"));

app.set("view engine", "ejs");
app.set("views", "./Server-handler/views");

server.listen(port, () => console.log(`Server is listening on port ${port}`));

const wsServer = new webSocketUsewebsocket.Server({
    port : port + 1
}, () => console.log(`WS is listening on port ${port + 1}`));

module.exports = {
    server : server,
    socket : serverWebSocket,
    app : app,
    io : {
        esp : esp8266,
        android : android,
        io : io
    },
    ws : wsServer
}
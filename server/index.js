const app_server_socket = require("./config/config-socket.io");
const bcrypt = require("bcrypt");
const env = require("dotenv");
const events = require("events");
const eventsPublic = require("./config/config-events");
const fs = require("fs");

env.config();

//const testing = require("./config/testing");
const token = require("./Token/config.js");
const esp32_cam = require("./Streaming-esp32Cam/config");
const car = require("./HandlerCar/handler.js");
const userLogin = require("./config/config-user-login");
const qrCode = require("./qrcode/qrcode");

const app = app_server_socket.app;
const esp8266 = app_server_socket.io.esp;
const android = app_server_socket.io.android;
const io = app_server_socket.io.io;
const websocket = app_server_socket.ws;
const route = require("./app.js")(app);
const maxCar = 5;
const userCar = new car(maxCar);
const passport = new token(128);
const EventEmitterLocal = new events.EventEmitter();

EventEmitterLocal.setMaxListeners(1000);
//EventEmitterLocal.addListener("find-position", data => userCar.FindPosFunc(data));
EventEmitterLocal.addListener("handler-qr-code", (data) => HandlerQRCodeFunc(data));

android.on("connection", (socket) => FunctionAndroid(socket));
//esp8266.on("connection", FunctionEsp8266);
io.on("connection", (socket) => FunctionEsp8266(socket));

// websocket.on("request", (req) => {
//     console.log("New connection");
//     req.on("requestAccepted", (connection) => {
//         connection.on("message", (dt) => console.log(dt));
//     })
// })

//testing.deleteUser("lamdethuong");

let clientSockets = [];

try {
    websocket.addListener("connection", (ws) => {
        console.log(`We have a new connection`);
        clientSockets.push(ws);
        ws.on("message", (data) => {
            EventEmitterLocal.emit("image", data);
        })
    })
}
catch (e) {
    console.log(e.message);
}

websocket.addListener("error", (err) => console.log(err));

function FunctionEsp8266(socket) {
    console.log(`New connection ${socket.id}`);
    
    EventEmitterLocal.addListener("car", (user) => {
        let send = {
            pos : user.pos,
            state : user.state
        }

        /*
            state = false
            -> Gửi xe
            state = true
            -> Nhận xe
        */

        io.sockets.emit("stateCar", send);
    })

    socket.on("image", (dt) => console.log(dt));
}

function FunctionIo(socket) {
    console.log("We have a new connection " + ssocket.id);
    EventEmitterLocal.addListener("image", (dt) => {
        socket.emit("image", dt);
    })
}

let yName = [];
let ySocket = [];

function FunctionAndroid(socket) {
    socket.on("result_decode", (dt) => ResultDecodeHandler(dt));

    socket.on("id", (dt) => {
        // dt is name user
        console.log("A new user login");
        socket.emit("id", socket.id);

        yName.push(dt);
        ySocket.push(socket.id);
    })

    socket.on("disconnect", destroyFunc);

    EventEmitterLocal.addListener("car", (user) => {
        let name = user.name;
        let id = undefined;
        yName.map((y, i) => {
            if(y === name) {
                id = ySocket[i];
            }
        });

        let send = {
            pos : user.pos,
            state : user.state,
            message : user.message
        }

        socket.to(id).emit("stateCar", send);

    })

    EventEmitterLocal.addListener("image", (dt) => {
        socket.emit("androidShowImg", dt);
    })
}

/**
 * 
 * @param {input} data
 * @param {output} lx_or_vx
 * 
 * lx_or_vx --> Function này có chức năng nhận biết người dùng lấy xe hoặc gửi xe 
 */

function HandlerQRCodeFunc(data) {
    let lx = data.lx;
    let vx = data.vx;
    let name = data.name;

    let user = {
        name : name,
        pos : undefined,
        state : undefined,
        message :undefined
    }

    if(lx !== undefined && vx !== undefined) {
        if(lx && vx) {
            // Lỗi
            //return;
        }

        if(!lx && !vx) {
            // Xử lý gửi xe
            console.log("Trường hợp cần gửi xe");
            let pos = userCar.FindPosFunc(user.name);
            user.state = false; // Gửi xe
            user.message = "Xe của bạn đang chuẩn bị được gửi!";
            user.pos = pos;

            EventEmitterLocal.emit("car", user);

            let pushU = {
                name : name,
                lx : true,
                vx : false
            }

            userLogin.get("state")
                    .remove({name : name})
                    .write();
            userLogin.get("state")
                    .push(pushU)
                    .write();
            //return;
        }

        if(lx && !vx) {
            // Xử lý nhận xe
            // Truy ngược lại trả về giá trị position
            let pos = userCar.SearchName(name);
            console.log("Vị trí xe là: " + pos);

            if(pos !== -1) {
                console.log("Trường hợp cần lấy xe");
                let valuePos = userCar.positionCar[pos];
                user.state = true; // Nhận xe
                user.message = "Vị trí xe của bạn cần lấy là: " + valuePos;
                user.pos = valuePos;

                EventEmitterLocal.emit("car", user);

                let pushU = {
                    name : name,
                    lx : true,
                    vx : true
                }

                userLogin.get("state")
                        .remove({name : name})
                        .write()
                        .push(pushU)
                        .write()                
            }

            //return;
        }

        if(lx && vx) {
            let pushU = {
                name : name,
                lx : false,
                vx : false
            }

            userLogin.get("state")
                    .remove({name : name})
                    .write()
                    .push(pushU)
                    .write()                
            userCar.RemoveName(name);

            let pos = userCar.FindPosFunc(user.name);
            user.state = false; // Gửi xe
            user.message = "Xe của bạn đang chuẩn bị được gửi!";
            user.pos = pos;

            EventEmitterLocal.emit("car", user);            
        }
    }
    else {
        // Set mặc định
        if(lx === undefined) {

        }
    }
}

function destroyFunc(socket) {
    // User ngắt kết nối
    console.log("User disconnected");

    // Xử lý sự kiện user ngắt kết nối
    if(ySocket.length !== 0 && yName.length !== 0) {
        let id = socket.id;
        let pos = -1;
        for(let i = 0; i < ySocket.length; i++) {
            if(id === ySocket[i]) {
                pos = i;
                break;
            }
        }

        console.log(`${ySocket}`);
        console.log(`${yName}`);

        if(pos !== -1) {
            let newArrSocket = ySocket.splice(pos, 1);
            let newArrName = yName.splice(pos, 1);
            let valueName = yName[pos];
            
            ySocket = newArrSocket;
            yName = newArrName;

            eventsPublic.emit("removeUser", valueName);

            console.log(`${ySocket}`);
            console.log(`${yName}`);
        }
    }
}

//let counter = 0;
function ResultDecodeHandler(data) {
    let send_android = {
        state : false
    }

    console.log(data);
    //let result_token_decode = passport.True_or_False(data.token, "android");

    if(true) {
        // Handler...
        let result = data.decode;
        let position$ = result.search("@");
        if(position$ !== -1) {
            let name = "";
            for(let i = position$ + 1; i < result.length; i ++)
                name += result[i];

            //console.log(name);
            let passport1 = userLogin.get("user")
                 .find({name: name})
                 .value();

            console.log(passport1);

            if(passport1 !== undefined) {
                let phoneArr = [];
                for(let i = 0; i < result.length; i++) {
                    if(result[i] === "#")
                        phoneArr.push(i);
                }

                let phone = "";
                for(let i = phoneArr[0] + 1; i < phoneArr[1]; i++) {
                    phone += result[i];
                }

                console.log(phone);
                if(bcrypt.compareSync(phone, passport1.phone)) {
                    console.log("Complete");
                    let valueCar = userLogin.get("state")
                                            .find({name : name})
                                            .value()

                    EventEmitterLocal.emit("handler-qr-code", valueCar);
                }
            }
        }
    }
    else EventEmitterLocal.emit("send", send_android);
}

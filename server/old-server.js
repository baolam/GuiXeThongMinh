const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const express = require("express");
const eventsLocal = require("events");
const eventsPublic = require("./config-events");
const fs = require("fs");
const http = require("http");
const socketio = require("socket.io");

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const EventEmitterLocal = new eventsLocal.EventEmitter();
EventEmitterLocal.setMaxListeners(100);

const create = require("./models/create");
const login = require("./models/login");
const userLogin = require("./config-user-login");
const esp8266 = io.of("/esp8266");
const android = io.of("/android");

let array_position = [];
let array_vt_generated = [];
let pos;
const maximum = 9;
//const array_xe_tg_ung = [];
// 0 --> nameA

const TOKEN_ESP = "Led324ngtexcFC78VGRaF12KLxxHJ&*9008";
const TOKEN_ANDROID = "wwhrewkBJK78JYDJ12hgkjsdhLKFJK*uj&6";

EventEmitterLocal.addListener("find-position", FindPosFunc);

/**
  * Các sự kiện socket -->
  *     newCar
  *     moveCar 
  */

/**
 * Các sự kiện server phát về cho người dùng
 *      position-nofi --> esp8266 sẽ lắng nghe sự kiện này --> Thông báo vị trí
 *      user-login --> gửi về cho android, hoạt động khi nghi ngờ người dùng chưa đăng nhập
 *      your-position --> gửi về cho android, cập nhập vị trí để xe của người dùng
 *      Car-DTT --> Xe đã tồn tại, gửi về cho android
 *      DoYouAHacker --> Sự kiện phát ra khi chuỗi chứng thực là sai, android
 *      moveCar-complete --> Lấy xe thành công, trả về cho android
 *      guess-at --> Máy ghi ngờ có người đã lấy xe
 *      noCar --> Vẫn chưa có xe, android
 */

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.use("/", login);
app.use("/", create);

esp8266.on("connection", (socket) => {
    // Gửi vị trí để xe
    EventEmitterLocal.addListener("your-position", obj => {
        let send = {
            token : TOKEN_ESP,
            vt : obj.ornum
        }
        socket.emit("position-nofi", send);
    })

    // Gửi vị trí lấy xe
    EventEmitterLocal.addListener("moveCar-complete", (data) => {
        let send = {
            token : TOKEN_ESP,
            vt : data
        }
        socket.emit("position-you-move-to-car", send);
    })
})

android.on("connection", (socket) => {
    socket.on("newCar", (dt) => {
        let yourName = dt.name;
        let arugement = dt.passport;
        let kq;

        if(arugement === TOKEN_ANDROID) {
            userLogin.then(config => {
                kq = config.get("state")
                      .find({name : yourName})
                      .value()
            })
            .catch(error => console.log(error));
    
            if(kq.name === undefined) {
                socket.emit("user-login");
            }
            else {
                let n = kq;
                if(kq.vx === false && kq.vx !== undefined) {
                    //array_position.push(kq.name);
                    n.vx = true;
    
                    // Generate a positon
                    EventEmitterLocal.emit("find-position", kq.name);
                    let obj = {
                        vt : array_vt_generated,
                        pos : array_position,
                        ornum : pos,
                        qr : fs.readFileSync(kq.image)
                    }
                    pos = 0;
                    socket.emit("your-position", obj);
                    EventEmitterLocal.emit("your-position", obj);
                }
                else {
                    socket.emit("Car-DTT"); // DTT : đã tồn tại
                }
    
                userLogin.then(config => {
                    config.get("state")
                          .find({name : yourName})
                          .push(n)
                          .write()
                })
            }
        }
        else {
            socket.emit("DoYouAHacker");
        }
    })

    socket.on("moveCar", (data) => {
        /**
         * @param {input} data
         * data sẽ là chuỗi kết quả giải mã của qr
         */

        let encoded = String(data);
        let kq1, kq2;
        userLogin.then(config => {
            kq = config.get("user")
                  .value()
        })

        let length = kq1.length;
        let counter = 0;

        for(let i = 0; i < length; i++) {
            if(kq1[i].phone === encoded) {
                userLogin.then(config => {
                    kq2 = config.get("state")
                          .find({name : kq1[i].name})
                          .value()
                })
                break;
            }
            else counter ++;
        }

        if(counter === length) {

        }
        if(kq2 !== undefined) {
            if(kq2.vx && !kq2.lx) {
                // Thoả mãn điều kiện để lấy xe
                // Đào ra vị trí của chỗ để xe
                /**
                 * 
                 * @param {input} kq2.name
                 * @param {output} vt
                 * 
                 * Thuật toán lấy vị trí của xe
                 * Vị trí của xe sẽ lấy được thông qua 2 biến array_position và array_vt_generated
                 * 
                 */

                let length = array_position.length;
                let vt;

                for(let i = 0; i < length; i++) {
                    if(array_position[array_vt_generated[i]] === kq2.name) {
                        vt = array_vt_generated[i];
                        break;                        
                    }
                }

                socket.emit("moveCar-complete", vt);
                EventEmitterLocal.emit("moveCar-complete", vt)
            }
            else if(! kq2.vx) {
                // Chưa có xe
                socket.emit("noCar");
            }
            else if(kq2.lx) {
                // Đã lấy xe
                // Nghi ngờ là đã có ăn trộm vào lấy xe
                socket.emit("guess-at"); 
            }
        }
        else {
            // Error
        }
    })
})

/**
 * @param {input} data
 * @param {output} pos
 * 
 * Thuật toán sinh vị trí
 * Sinh trước 1 vị trí
 * Kiểm tra vị trí đó đã tồn tại hay chưa
 *     + Nếu tồn tại thì sinh lại lần mới --> Thực hiện lại các bước trên
 *     + Ngược lại cho qua, kết thúc thuật toán
 *  
 */
function FindPosFunc(data) {
    let conditon_stop = false;
    let newPos;
    while(! conditon_stop) {
        newPos = Math.floor(Math.random() % (maximum - 0));
        if(array_vt_generated[0] === undefined || array_vt_generated[0] === null) {
            array_vt_generated.push(newPos);
            array_position[newPos] = data;
            conditon_stop = true;
        }
        else {
            let detect_pos = false;
            for(let i = 0; i < array_vt_generated.length; i++) {
                if(array_vt_generated[i] === newPos) {
                    detect_pos = true;
                    break;
                }
            }
            if(!detect_pos) {
                array_vt_generated.push(newPos);
                array_position[newPos] = data;
                conditon_stop = true;
            } else conditon_stop = false;
        }
    }
    pos = newPos;
    console.log(array_position);
}

// Khởi tạo máy chủ
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

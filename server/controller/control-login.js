const bcrypt = require("bcrypt");
const events = require("../config/config-events");
const shortId = require("shortid");
const qrCode = require("../qrcode/qrcode");
const users = require("../config/config-database");
const login = require("../config/config-user-login");
const token = require("../Token/config.js");
const genSaltRound = 11;

const qrToken = new token(128);

events.addListener("removeUser", RemoveUserFunc);

module.exports.LOGIN = (req, res) => {
	let name = req.body.name;
	let password = req.body.password;

	let json = {
		error : undefined,
		message : undefined,
		name : undefined,
		state : undefined,
		special : undefined
	}			

	let user = users.get("data")
			  .find({name : name})
			  .value()

	console.log(user);
	
	if(user === undefined) {
		json.error = true;
		json.state = false; // Lỗi ứng với th này
		json.message = "Can't found " + name + " in system";
	}
	else {
		name_db = user.name;
		pass_db = user.password;
		if(bcrypt.compareSync(password, pass_db)) {
			json.special = user.special;

			if(json.special === undefined) 
				json.special = false;

			json.error = false;
			json.name = name;
			json.message = "Welcome " + name;
		}
		else {
			json.error = true;
			json.state = true; // Lỗi message
			json.message = "Wrong name or password";
		}
	}
	res.status(200).send(json);
}

module.exports.GET_STRING_WILL_GENERATE_QR = (req, res) => {
    let name = req.body.name;
    let qr = req.body.QR;
    let socketid = req.body.socketid;
    let kq = login.get("user")
                  .find({name : name})
                  .value();

    let generateQR = qrCode.Write;

    let generateString = shortId.generate() + "#" + qr + "#" + shortId.generate() + "@" + name;
    let urlImg = generateString + ".png";

    let send = {
        error : undefined,
        text : undefined
    }

    let hashQR = bcrypt.hashSync(qr, genSaltRound);

    if(kq === undefined) {
        // Save to login db
        let user = users.get("data")
                        .find({name : name})
                        .value()

        console.log(generateQR.path + urlImg);

        if(user !== undefined) {
            let db = {
                name : name,
                img : generateQR.path + urlImg,
                phone : hashQR,
                id : socketid,
                online : true
            }

            let car = {
                name : name,
                lx : false, // Gửi xe
                vx : false // Lấy xe
            }

            generateQR.create(generateString, generateString);

            login.get("user")
                 .push(db)
                 .write();

            login.get("state")
                 .push(car)
                 .write();

            send.error = false;
            send.text = generateString;
        }
        else {
            // User chưa tồn tại
            send.error = true;
        }
    }
    else {
        console.log("Đang chạy");
        let newDt = kq;

        newDt.img = generateQR.path + urlImg;
        newDt.phone = hashQR;

        //console.log(kq);
        console.log(newDt);

        if(newDt.img === kq.img) {
            generateQR.create(generateString, generateString);
            let car = {
                name : name,
                lx : false, // Gửi xe
                vx : false // Lấy xe
            }

            login.get("state")
                 .push(car)
                 .write();
        }

        login.get("user")
             .remove({name : name})
             .write();
        login.get("user")
             .push(newDt)
             .write();

        send.error = false; 
    }

    res.status(200).send(send);
}

function RemoveUserFunc(data) {
    let kq = login.get("user")
                .find({name : data})
                .value()
    let statekq = login.get("state")
                       .find({name : data})
                       .value()

    if(kq !== undefined && statekq !== undefined) {
        login.get("user")
             .remove({name : data})
             .write()

        login.get("state")
             .remove({name : data})
             .write()

        console.log("Remove complete");
    }
    else {
        console.log("User chưa tồn tại");
    }
}

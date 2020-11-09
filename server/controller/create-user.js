const bcrypt = require("bcrypt");
const shortid = require("shortid");

const qrCode = require("../qrcode/qrcode");
const userFile = require("../config/config-database");
const userLogin = require("../config/config-user-login");
const genSaltRound = 11;

module.exports.CREATE = (req, res) => {
    console.log(req.body);
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;

    // Filter
    let kq1 = Filter(name);
    let kq2 = Filter(password);
    let kq3 = Filter(email);

    let response = {
    	error : undefined,
    	name : undefined,
    	message : undefined,
    	state : undefined
    }

    if(! kq1 && ! kq2 && ! kq3) {
    	response.error = false;
    	let hashPassword = bcrypt.hashSync(password, genSaltRound);
    	let db = {
    		name : name,
    		password : hashPassword,
    		email : email,
    	}

    	let loginU = {
    		name : name,
    		imgUrl : undefined,
    		yourQR : undefined
    	}

    	let knowUser = false;
    	// Check user name
    	let resulultU = userFile.get("data")
       		    .find({name : name})
    			.value();

        try {
            console.log("Đang cố gắng");
            if(resulultU !== undefined) {
                console.log("User is defined");
                knowUser = true;
            }
        }
        catch (e) {
            console.log(e.message);
            knowUser = false;
        }

    	if(! knowUser) {
	    	userFile.get("data")
	    		  .push(db)
	   			  .write()
	    	userFile.get("user")
	    		  .push(loginU)
	   			  .write()

	    	response.name = name;
	    	response.message = "Welcome " + name;
	    	response.state = true; // Generate QR
    	}
    	else {
    		response.name = name;
    		response.error = true;
    		response.message = "User đã tồn tại";
    	}
    }
    else {
    	response.error = true;
    	response.message = "Char error";
    }

    res.status(200).send(response);
}

module.exports.TEST = (req, res) => {
    res.render("index.ejs");
}

function Filter(r) {
    return false;
}
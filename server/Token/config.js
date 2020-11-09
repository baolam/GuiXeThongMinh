class Config {
	constructor(number) {
		this.ALPHABET = "abcdefghijklmnbvbjhkkkhgnkert09358opqrstuavhgf12110vwxyzAB035fCDEFGHIJKLMNOPQRSTfsdjUVWXYZ0123456789dagfy";
		this.TOKEN_ANDROID = [10, 6, 7, 27, 11, 8, 2, 31, 29, 15, 32, 16, 17, 33, 19, 25, 39, 40, 62, 73];
		this.TOKEN_ESP = [10, 5, 17, 1, 11, 6, 2, 8, 9, 15, 32, 16, 17, 18, 19, 25, 43, 42, 61, 29];
		this.TOKEN_ESP32CAM = [1, 5, 21, 10, 2, 30, 3, 8, 9, 15, 35, 16, 40, 18, 19, 25, 41, 40, 60, 42];
		this.TOKEN_ANDROID_QR = [1, 5, 6, 7, 2, 3, 10, 15, 20, 25, 30, 27, 12, 13, 60, 45, 34, 52, 45];
		this.number = number;

		this.tAndroid = this.Encode(this.ALPHABET, this.TOKEN_ANDROID);
		this.tEsp = this.Encode(this.ALPHABET, this.TOKEN_ESP);
		this.tAndroidQR = this.Encode(this.ALPHABET, this.TOKEN_ANDROID_QR);
	}

	Decode(data) {
		let result = "";
	    for(let i = 0; i < data.length; i++) {
	        result += ALPHABET[data[i]];
	    }

	    return result;
	}

	GenerateCBM(data) {
		let array = data.array;
		let result_1 = "";

		// Generate the token
		for(let i = 0; i < this.number; i++) {
	        let char = ALPHABET[Math.floor(Math.random() * length)];
	        result_1 += char;
	    }

	    function ax(cs, gt) {
	        for(let i = 0; i < array.length; i++) {
	            let cs_a = array[i];
	            if(cs === cs_a) {
	                return TOKEN[cs_a];
	            }    
	        }
	    }

	    let result_arr_string = String(result_1).split("").map((vl, cs) => {
        	return ax(cs, vl);
        });

        let result_offical = "";
        for(let i = 0; i < this.number; i++)
        	result_offical += result_arr_string[i];

        return result_offical;
    }

    Encode(dt, state) {
    	let result = "";
    	for(let i = 0; i < state.length; i ++) {
    		result += dt[state[i]];
    	}
    	return result;
    } 

   	True_or_False(dt, chedo) {
   		let r;
   		let cd = String(chedo);
   		if(cd === "android") {
   			r = this.Encode(dt, this.TOKEN_ANDROID);
   			if(r === this.tAndroid) 
   				return true;
   			else 
   				return false;
   		}
   		else if(r === "qr") {
   			r = this.Encode(dt, this.TOKEN_ANDROID_QR);
   			if(r === this.tAndroidQR) 
   				return true;
   			else 
   				return false;
   		}
   		else {
   			r = this.Encode(dt, this.TOKEN_ESP);
   			if(r === this.tEsp) 
   				return true;
   			else 
   				return false;
   		}
   		return false;
   	}
}

module.exports = Config;
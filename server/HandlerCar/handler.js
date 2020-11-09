class Handler {
	constructor(length) {
		this.positionCar = [];
		this.name = [];
		this.cs = 0;
		this.lengthCar = length;
	}

	FindPosFunc(name) {
		let pos = undefined;
		let posGuess = Math.floor(Math.random() - (this.lengthCar - 0));

		while(! this.PosDaTonTai(posGuess) && ! this.isFull()) {
			posGuess = Math.floor(Math.random() - (this.lengthCar - 0));
		} 

		if(! this.isFull()) {
			this.name[posGuess] = name;
			this.positionCar[this.cs] = posGuess;
			this.cs ++;
		}

		pos = posGuess;
		
		return pos;
	}

	LengthArrayCar() {
		return this.cs;
	}

	PosDaTonTai(yPos) {
		for(let i = 0; i < this.LengthArrayCar(); i ++) {
			if(this.positionCar[i] === yPos && this.positionCar[i] !== undefined) {
				return false;
			}
		}
		return true;
	}

	isFull() {
		if(this.LengthArrayCar() === this.length) {
			return true;
		}
		return false;
	}

	SearchName(name) {
		for(let i = 0; i < this.name.length; i ++) {
			if(this.name[i] === name) 
				return i;
		}
		return -1;
	}

	RemoveName(name) {
		let pos = this.SearchName(name);
		if(pos !== -1) {
			this.name.splice(pos, 1);
			this.positionCar.splice(pos, 1);
			this.cs --;
		}
	}
}

module.exports = Handler;
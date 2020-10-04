class Tetromino {
	constructor(specifcPiece) {
		let self = this;
		self.piece = self.selectRandomPiece(specifcPiece);
		self.piece.orientation = self.piece.definition.defaultOrientation;
		self.piece.position = {
				x:self.piece.definition.defaultPosition.x,
				y:self.piece.definition.defaultPosition.y
			};
		self.piece.colour = self.getPieceColour();
	}
	getPieceI() {
		let i = {
		up: [
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 2,
			relativeY: 0,
			},
		],
		right: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
			{
			relativeX: 0,
			relativeY: 2,
			},
		],
		down: [
			{
			relativeX: -2,
			relativeY: 0,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		left: [
			{
			relativeX: 0,
			relativeY: -2,
			},
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 1
		},
		offset: {
			x: 0.5,
			y: 1
		}
		};
		return i;
	}
	getPieceO() {
		let o = {
		up: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		right: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		down: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		left: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 2
		},
		offset: {
			x: 0.5,
			y: 0.5
		}		
		};
		return o;
	}
	getPieceT() {
		let t = {
		up: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		right: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		down: [
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		left: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 2
		},
		offset: {
			x: 1,
			y: 0.5
		}
		};
		return t;
	}
	getPieceS() {
		let s = {
		up: [
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 1,
			relativeY: -1,
			},
		],
		right: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 1,
			},
		],
		down: [
			{
			relativeX: -1,
			relativeY: 1,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		left: [
			{
			relativeX: -1,
			relativeY: -1,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 2
		},
		offset: {
			x: 1,
			y: 0.5
		}
		};
		return s;
	}
	getPieceZ() {
		let z = {
		up: [
			{
			relativeX: -1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		right: [
			{
			relativeX: 1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		down: [
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
			{
			relativeX: 1,
			relativeY: 1,
			},
		],
		left: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: -1,
			relativeY: 1,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 2
		},
		offset: {
			x: 1,
			y: 0.5
		}
		};
		return z;
	}
	getPieceJ() {
		let j = {
		up: [
			{
			relativeX: -1,
			relativeY: -1,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		right: [
			{
			relativeX: 1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		down: [
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 1,
			},
		],
		left: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
			{
			relativeX: -1,
			relativeY: 1,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 2
		},
		offset: {
			x: 1,
			y: 0.5
		}
		};
		return j;
	}
	getPieceL() {
		let l = {
		up: [
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: -1,
			},
		],
		right: [
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
			{
			relativeX: 1,
			relativeY: 1,
			},
		],
		down: [
			{
			relativeX: -1,
			relativeY: 1,
			},
			{
			relativeX: -1,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 1,
			relativeY: 0,
			},
		],
		left: [
			{
			relativeX: -1,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: -1,
			},
			{
			relativeX: 0,
			relativeY: 0,
			},
			{
			relativeX: 0,
			relativeY: 1,
			},
		],
		defaultOrientation: "up",
		defaultPosition: {
			x: 1,
			y: 2
		},
		offset: {
			x: 1,
			y: 0.5
		}
		};
		return l;
	}
	selectRandomPiece(specifcPiece) {
		let self = this;		
		let options = ["I","O","T","S","Z","J","L"];
		let randomNumber = Math.random();
		let randomNumberRange = randomNumber * 7;
		let randomNumberRangeInt = Math.floor(randomNumberRange);
		let selectedPieceName = specifcPiece || options[randomNumberRangeInt];
		return {
			name:selectedPieceName,
			definition: self[`getPiece${selectedPieceName}`]()
		};
	}
	getPieceColour() {
		let self = this;
		let colourMap = {
			"I": "red",
			"O": "teal",
			"T": "yellow",
			"S": "blue",
			"Z": "orange",
			"J": "purple",
			"L": "green"
		}
		return colourMap[self.piece.name];
	}	
}

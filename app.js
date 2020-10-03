let width = 10;
let height = 20;
let scale = 40;
let tetris;
let board;
let score;
let failureState;
let storedPiece = {
	piece: null,
	board: null,
	canvas: null
};
let currentPiece;
let nextPiece = {
	piece: null,
	board: null,
	canvas: null
};
let tick = {
	rate: 500,
	interval: null
};

// TO-DO
// Slam piece down
// create buttons to start/stop/pause/restart etc.

function initBoard() {

}
function initNextPiece() {
	nextPiece.board = new Board(5,5,0);
	nextPiece.canvas = new Canvas("next", 5, 5, scale);
	document.querySelector("#container").appendChild(nextPiece.canvas.canvas);
	nextPiece.canvas.setBoard(nextPiece.board.exportColours())
	nextPiece.canvas.startAnimation();
}
function initStoredPiece() {
	storedPiece.board = new Board(5,5,0);
	storedPiece.canvas = new Canvas("held", 5, 5,scale);
	document.querySelector("#container").prepend(storedPiece.canvas.canvas);
	storedPiece.canvas.setBoard(storedPiece.board.exportColours())
	storedPiece.canvas.startAnimation();
}
function addPiece(event,setPiece) {
	currentPiece = setPiece || nextPiece.piece || new Tetromino();
	if (!setPiece) {
		getNextPiece();
	}
	board.addPieceToBoard(currentPiece);
	updateBoardState();
}
function getNextPiece() {
	nextPiece.piece = new Tetromino();
	nextPiece.board.resetBoard();
	nextPiece.canvas.clearBoard();
	nextPiece.board.addPieceToDisplay(nextPiece.piece);
	nextPiece.canvas.setOffset(nextPiece.piece.piece.definition.offset)
	nextPiece.canvas.setBoard(nextPiece.board.exportColours());
	nextPiece.canvas.drawBoard();
}
function swapStoredPiece() {
	let tempPiece = currentPiece;
	if (storedPiece.piece) {
		currentPiece = storedPiece.piece;
		addPiece(new Event("addPiece"),currentPiece);
	} else {
		addPiece();
	}
	storedPiece.piece = tempPiece;
	renderStoredPiece();
}
function renderStoredPiece() {
	storedPiece.board.resetBoard();
	storedPiece.canvas.clearBoard();
	storedPiece.board.addPieceToDisplay(storedPiece.piece);
	storedPiece.canvas.setOffset(storedPiece.piece.piece.definition.offset)
	storedPiece.canvas.setBoard(storedPiece.board.exportColours());
	storedPiece.canvas.drawBoard();
}
function updateBoardState() {
	let clearedLines = board.checkCompleteLine();
	updateScore(clearedLines)
	failureState = board.checkGameFailureState();
	tetris.setBoard(board.exportColours());
	tetris.drawBoard();
	if (failureState) {
		stopGame()
	}
}
function updateScore(clearedLines) {
	switch (clearedLines.length) {
		case 4:
			score += 300;
		case 3:
			score += 200;
		case 2:
			score += 200
		case 1:
			score += 100;
	}
	document.querySelector("#score").innerText = score;
}
function moveDown() {
	board.movePieceDown();
	updateBoardState();
}
function moveLeft() {
	board.movePieceLeft();
	updateBoardState();
}
function moveRight() {
	board.movePieceRight();
	updateBoardState();
}
function rotateClockWise() {
	board.rotatePieceClockwise();
	updateBoardState();
}
function rotateAntiClockWise() {
	board.rotatePieceAntiClockwise();
	updateBoardState();
}
function startGame() {
	score = 0;
	document.addEventListener("addPiece",addPiece);
	document.addEventListener("keydown",keyPressHandler);
	initNextPiece();
	initStoredPiece();
	board.startGame();
	tetris.setBoard(board.exportColours())
	tetris.startAnimation();	
	clearInterval(tick.interval);
	tick.interval = setInterval(moveDown,tick.rate);
}
function stopGame() {
	board = new Board(width,height);
	tetris.setBoard(board.exportColours())
	document.removeEventListener("addPiece",addPiece);
	document.removeEventListener("keydown",keyPressHandler);
	clearInterval(tick.interval);
	tetris.stopAnimation()
}
function pageLoad() {
	tetris = new Canvas("tetris",width,height,scale);
	board = new Board(width,height);
	document.querySelector("#container").appendChild(tetris.canvas);
	startGame();
	
}
function keyPressHandler(event) {
	switch(event.key) {
		case "ArrowDown":
		case "Down":
		case "s":
			moveDown();
			break;
		case "ArrowRight":
		case "Right":
		case "d":
			moveRight();
			break;
		case "ArrowLeft":
		case "Left":
		case "a":
			moveLeft();
			break;
		case "ArrowUp":
		case "Up":
		case "w":
			//slamDown()
			break;
		case "e":
			rotateClockWise();
			break;
		case "q":
			swapStoredPiece();
			break;
	}
}

window.addEventListener("load", pageLoad);
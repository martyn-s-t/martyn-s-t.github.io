class Board {
    constructor(width, height, start = -4, startX, startY) {
        let self = this;
        self.width = width;
        self.height = height;
        self.start = start;
        self.startX = startX || Math.floor(self.width/2);
        self.startY = startY || Math.floor(self.start/2);
        self.resetBoard();
    }
    resetBoard() {
        let self = this;
        self.boardState = self.generateBoardEmpty();
    }
    startGame() {
        let self = this;
        self.resetBoard();
        self.requestPiece();
    }
    generateBoardEmpty() {
        let self = this;
        let height = self.height;
        let width = self.width;
        let boardState = {}
        for (let i = self.start; i < height; i++) {
            boardState[i] = {};
            for (let j = 0; j < width; j++) {
                boardState[i][j] = self.generateBoardCellEmpty(i,j);
            }
        }
        return boardState;
    }
    generateBoardCellEmpty(x, y) {
        return {
            positionX: x,
            positionY: y,
            colour: "white",
            isEmpty: true,
            isFixed: false,
            isCenter: false,
            piece: undefined
        };
    }
    generateBoardCellFixed(x, y) {
        return {
            positionX: x,
            positionY: y,
            colour: "black",
            isEmpty: false,
            isFixed: true,
            isCenter: false,
            piece: undefined
        };
    }
    generateBoardCellPiece(x, y, piece, isCenter = false) {
        return {
            positionX: x,
            positionY: y,
            colour: piece.colour,
            isEmpty: false,
            isFixed: false,
            isCenter: isCenter,
            piece: piece
        };
    }
    addPieceToBoard(pieceToAdd) {
        let self = this;
        let startPositionY = self.startY;
        let startPositionX = self.startX;
        let fixedBoardState = self.getFixedBoard()
        self.resetBoard();
        self.setBoardState(fixedBoardState);
        pieceToAdd.piece.position.x = startPositionX;
        pieceToAdd.piece.position.y = startPositionY;
        for (let value of pieceToAdd.piece.definition[pieceToAdd.piece.orientation]) {
            let piecePositionX = startPositionX + value.relativeX;
            let piecePositionY = startPositionY + value.relativeY;
            self.boardState[piecePositionY][piecePositionX] = self.generateBoardCellPiece(piecePositionY,piecePositionX, pieceToAdd.piece, (value.relativeX === 0 && value.relativeY === 0));
        }
    }
    addPieceToDisplay(pieceToAdd){
        let self = this;
        let startPositionY = pieceToAdd.piece.definition.defaultPosition.y;
        let startPositionX = pieceToAdd.piece.definition.defaultPosition.x; 
        for (let value of pieceToAdd.piece.definition[pieceToAdd.piece.definition.defaultOrientation]) {
            let piecePositionX = startPositionX + value.relativeX;
            let piecePositionY = startPositionY + value.relativeY;
            self.boardState[piecePositionY][piecePositionX] = self.generateBoardCellPiece(piecePositionY,piecePositionX, pieceToAdd.piece, (value.relativeX === 0 && value.relativeY === 0));
        }
    }
    getFixedBoard() {
        let self = this;
        let fixedBoard = {};
        for (let i = self.start; i < self.height; i++) {
            for (let j = 0; j < self.width; j++) {
                if (self.boardState[i][j].isFixed) {
                    fixedBoard[i] = fixedBoard[i] || {};
                    fixedBoard[i][j] = self.boardState[i][j];
                }
            }
        }
        return fixedBoard;
    }
    exportColours() {
        let self = this;
        let colours = [];
        for (let i = 0; i < self.height; i++) {
            colours[i] = [];
            for (let j = 0; j < self.width; j++) {
                colours[i][j] = self.boardState[i][j].colour;
            }
        }
        return colours;
    }
    setBoardState(newBoardState) {
        let self = this;
        for (let i in newBoardState) {
            for (let j in newBoardState[i]) {
                self.boardState[i][j] = newBoardState[i][j]
            }
        }
    }
    movePieceDown() {
        let self = this;
        let newState = {};
        for (let i = -3; i < self.height; i++) {
            newState[i] = {};
            for (let j = 0; j < self.width; j++) {
                if ((i === self.height - 1) && !self.boardState[i][j].isEmpty && !self.boardState[i][j].isFixed) {
                    self.affixPieces();
                    return;
                }
                if (self.boardState[i][j].isFixed && !self.boardState[i-1][j].isEmpty && !self.boardState[i-1][j].isFixed) {
                    self.affixPieces();
                    return;
                }
                if (self.boardState[i][j].isFixed || self.boardState[i-1][j].isFixed) {
                    newState[i][j] = self.boardState[i][j];
                } else {
                    newState[i][j] = self.boardState[i-1][j];
                }
            }
        }
        self.resetBoard();
        self.setBoardState(newState);
    }
    movePieceLeft() {
        let self = this;
        let newState = {};
        for (let i = self.start; i < self.height; i++) {
            newState[i] = {};
            for (let j = 0; j < self.width - 1; j++) {
                if (self.boardState[i][j].isFixed && !self.boardState[i][j+1].isEmpty && !self.boardState[i][j+1].isFixed) {
                    return;
                }
                if (!j && !self.boardState[i][j].isEmpty && !self.boardState[i][j].isFixed) {
                    return;
                }
                if (self.boardState[i][j].isFixed) {
                    newState[i][j] = self.boardState[i][j];
                } else if (self.boardState[i][j+1].isFixed) {
                    newState[i][j] = self.generateBoardCellEmpty(i,j);
                } else {
                    newState[i][j] = self.boardState[i][j+1];
                }
            }
        }
        let fixedBoardState = self.getFixedBoard()
        self.resetBoard();
        self.setBoardState(fixedBoardState);
        self.setBoardState(newState);
    }
    movePieceRight() {
        let self = this;
        let newState = {};
        for (let i = self.start; i < self.height; i++) {
            newState[i] = {};
            for (let j = 1; j < self.width; j++) {
                if (self.boardState[i][j].isFixed && !self.boardState[i][j-1].isEmpty && !self.boardState[i][j-1].isFixed) {
                    return;
                }
                if (j === self.width - 1 && !self.boardState[i][j].isEmpty && !self.boardState[i][j].isFixed) {
                    return;
                }
                if (self.boardState[i][j].isFixed) {
                    newState[i][j] = self.boardState[i][j];
                } else if (self.boardState[i][j-1].isFixed) {
                    newState[i][j] = self.generateBoardCellEmpty([i][j]);
                } else {
                    newState[i][j] = self.boardState[i][j-1];
                }
            }
        }
        let fixedBoardState = self.getFixedBoard()
        self.resetBoard();
        self.setBoardState(fixedBoardState);
        self.setBoardState(newState);
    }
    affixPieces() {
        let self = this;
        let newState = {};
        for (let i = self.start; i < self.height; i++) {
            newState[i] = {};
            for (let j = 0; j < self.width; j++) {
                if (!self.boardState[i][j].isEmpty) {
                    newState[i][j] = self.generateBoardCellFixed(i,j);
                }
            }
        }   
        self.resetBoard();
        self.setBoardState(newState);
        self.requestPiece();
    }
    requestPiece() {
        document.dispatchEvent(new Event("addPiece"));
    }
    rotatePieceClockwise() {
        let self = this;
        let newState = {};
        for (let i = self.start; i < self.height; i++) {            
            for (let j = 0; j < self.width; j++) {
                let cell = self.boardState[i][j];
                let piece = cell.piece;
                if (cell.isCenter) {
                    let definitions = Object.entries(piece.definition);
                    let currentDefinitionIndex = definitions.findIndex(entry => entry[0] === cell.piece.orientation);
                    let newDefinitionIndex = (currentDefinitionIndex + 1) % 4;                    
                    let newOrientation = definitions[newDefinitionIndex][1];
                    for (let block of newOrientation) {
                        let piecePositionX = j + block.relativeX;
                        let piecePositionY = i + block.relativeY;
                        newState[piecePositionY] = newState[piecePositionY] || {};
                        if (piecePositionX < 0 || piecePositionX > self.width - 1) {
                            return;
                        }
                        if (self.boardState[piecePositionY][piecePositionX].isFixed) {
                            return;
                        }
                        newState[piecePositionY][piecePositionX] = self.generateBoardCellPiece(piecePositionY,piecePositionX,piece,(block.relativeX === 0 && block.relativeY === 0));
                    }
                    piece.orientation = definitions[newDefinitionIndex][0];
                }
            }
        }
        let fixedBoardState = self.getFixedBoard()
        self.resetBoard();
        self.setBoardState(fixedBoardState);
        self.setBoardState(newState);
    }
    rotatePieceAntiClockwise() {
        let self = this;
        let newState = {};
        for (let i = self.start; i < self.height; i++) {            
            for (let j = 0; j < self.width; j++) {
                let cell = self.boardState[i][j];
                let piece = cell.piece;
                if (cell.isCenter) {
                    let definitions = Object.entries(piece.definition);
                    let currentDefinitionIndex = definitions.findIndex(entry => entry[0] === cell.piece.orientation);
                    let newDefinitionIndex = (currentDefinitionIndex + 3) % 4;                    
                    let newOrientation = definitions[newDefinitionIndex][1];                    
                    for (let block of newOrientation) {
                        let piecePositionX = i + block.relativeX;
                        let piecePositionY = j + block.relativeY;
                        newState[piecePositionX] = (newState[piecePositionX] || {});
                        if (piecePositionX < 0 || piecePositionX > self.width - 1) {
                            return;
                        }
                        newState[piecePositionX][piecePositionY] = self.generateBoardCellPiece(piecePositionX, piecePositionY, piece, (block.relativeX === 0 && block.relativeY === 0));
                    }
                    piece.orientation = definitions[newDefinitionIndex][0];
                }
            }
        }
        let fixedBoardState = self.getFixedBoard()
        self.resetBoard();
        self.setBoardState(fixedBoardState);
        self.setBoardState(newState);
    }
    checkCompleteLine() {
        let self = this;
        let clearLines = [];
		for (let i = self.start; i < self.height; i++) {
            let every = [];
			for (let j = 0; j < self.width; j++) {
				every[j] = self.boardState[i][j].isFixed;
            }
            if (every.every(ele => ele)) {
                clearLines.push(i);
            }
        }
        self.removeCompleteLines(clearLines);
        return clearLines;
    }
    removeCompleteLines(clearLines) {
        let self = this;
        let newState = {};
        clearLines.forEach(row => {
            for (let i = -3; i < self.height; i++) {
                newState[i] = {};
                for (let j = 0; j < self.width; j++) {
                    if (i > row) {
                        newState[i][j] = self.boardState[i][j];
                    } else {
                        newState[i][j] = self.boardState[i-1][j];
                    }
                }
            }
            self.resetBoard();
            self.setBoardState(newState);
        });
    }
    checkGameFailureState() {
        let self = this;
        for (let i = - 4; i < 0; i++) {
            for (let j = 0; j < self.width; j++) {
                if (self.boardState[i][j].isFixed) {
                    return true;
                }
            }
        }
    }
}
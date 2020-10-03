class Canvas {
    constructor(id, width, height, scale, offsetX = 0, offsetY = 0) {
        let self = this;
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");

        self.width = width;
        self.height = height;
        self.scale = scale;
        self.offsetX = offsetX;
        self.offsetY = offsetY;

        canvas.id = id;
        canvas.width = self.width * self.scale;
        canvas.height = self.height * self.scale;
        self.canvas = canvas;
        self.ctx = ctx;

        self.animation = {};
        self.animation.startTime;
        self.animation.currentTime;
        self.animation.frameCount;        

        self.board = self.initBoard();
    }
    setOffset(offset) {
        let self = this;
        self.offsetX = offset.x;
        self.offsetY = offset.y;
    }
    initBoard() {
        let self = this;
        self.board = [];
        for (let i = 0; i < self.height; i++) {
            self.board[i] = [];
            for (let j = 0; j < self.width; j++) {
                self.board[i][j] = "white";
            }
        }
    }
    setBoard(board) {
        let self = this;
        self.board = board;
    }
    clearBoard() {
        let self = this;
        self.ctx.clearRect(0,0,self.width * self.scale,self.height * self.scale);
        self.ctx.fillRect(0,0,self.width * self.scale,self.height * self.scale);
    }
    drawBoard() {
        let self = this;
        for (let i = 0; i < self.height; i++) {
            for (let j = 0; j < self.width; j++) {
                self.ctx.fillStyle = self.board[i][j];
                self.ctx.fillRect((self.offsetX + j) * self.scale,(self.offsetY + i) * self.scale,self.scale,self.scale);
            }
        }
    }
    startAnimation() {
        let self = this;
        if (!self.animation.startTime) {
            self.animation.startTime = Date.now();
        }
        self.animation.currentTime = Date.now();
        self.animation.frameCount = (self.animation.frameCount || 0) + 1;
        self.clearBoard();
        self.drawBoard();
        self.animationId = requestAnimationFrame(() => self.startAnimation());
    }
    stopAnimation() {
        let self = this;
        cancelAnimationFrame(self.animationId);
        self.animationId = null;
    }
}
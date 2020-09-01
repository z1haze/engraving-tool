import store from './store';

export default class CanvasManager {
    constructor (args) {
        this.canvas = args.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.canvasX = $(this.canvas).offset().left;
        this.canvasY = $(this.canvas).offset().top;

        // defaults
        this.mousedown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.initEvents();
    }

    clear () {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    }

    drawRect (xStart, yStart, xStop, yStop) {
        this.clear();

        this.ctx.beginPath();

        this.ctx.rect(xStart, yStart, xStop - xStart, yStop - yStart);

        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1;
        this.ctx.stroke();

        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = '#007bff';
        this.ctx.fill();

        return [xStart, yStart, xStop, yStop];
    }

    initEvents () {
        // handle mouse down
        $(this.canvas).on('mousedown', (e) => {
            if (this.canvasX === 0 && this.canvasY === 0) {
                this.canvasX = $(this.canvas).offset().left;
                this.canvasY = $(this.canvas).offset().top;
            }

            this.lastMouseX = parseInt(e.clientX - this.canvasX);
            this.lastMouseY = parseInt(e.clientY - this.canvasY);

            this.mousedown = true;
        });

        // handle mouse up
        $(this.canvas).on('mouseup', () => {
            this.mousedown = false;

            const width = this.mouseX - this.lastMouseX;
            const height = this.mouseY - this.lastMouseY;

            if (width !== 0 && height !== 0) {
                if (this.mouseX < this.lastMouseX) {
                    [this.mouseX, this.lastMouseX] = [this.lastMouseX, this.mouseX];
                }

                if (this.mouseY < this.lastMouseY) {
                    [this.mouseY, this.lastMouseY] = [this.lastMouseY, this.mouseY];
                }

                store.dispatch({
                    type: 'SET',
                    key : 'textArea',
                    val : [this.lastMouseX, this.lastMouseY, this.mouseX, this.mouseY],
                });
            }
        });

        // handle mouse move
        $(this.canvas).on('mousemove', (e) => {
            if (this.mousedown) {
                this.mouseX = parseInt(e.clientX - this.canvasX);
                this.mouseY = parseInt(e.clientY - this.canvasY);

                let mouseX = this.mouseX;
                let mouseY = this.mouseY;
                let lastMouseX = this.lastMouseX;
                let lastMouseY = this.lastMouseY;

                if (mouseX < lastMouseX) {
                    [mouseX, lastMouseX] = [this.lastMouseX, this.mouseX];
                }

                if (mouseY < lastMouseY) {
                    [mouseY, lastMouseY] = [this.lastMouseY, this.mouseY];
                }

                store.dispatch({
                    type: 'SET',
                    key : 'textArea',
                    val : [lastMouseX, lastMouseY, mouseX, mouseY],
                });

                this.drawRect(this.lastMouseX, this.lastMouseY, this.mouseX, this.mouseY);
            }
        });
    }
}
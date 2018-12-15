import { ICanvasState } from '../components/Canvas/CanvasInterfaces';

export default class Liquid {
    x: number;
    y: number;
    width: number;
    height: number;
    dragCoeficcient: number;

    constructor(x: number, y: number, width: number, height: number, dragCoeficcient: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dragCoeficcient = dragCoeficcient;
    }

    display(state: ICanvasState) {
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.rect(this.x, this.y, this.width, this.height);
            state.ctx.fillStyle = "#0077be";
            state.ctx.fillRect(this.x, this.y, this.width, this.height);
            state.ctx.stroke();
        }
    }
}
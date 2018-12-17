import { ICanvasState } from '../components/Canvas/CanvasInterfaces';

export default class Liquid {
    x: number;
    y: number;
    width: number;
    height: number;
    dragCoeficcient: number;
    private color: string = '#0077be';

    constructor(x: number, y: number, width: number, height: number, dragCoeficcient: number, color?: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dragCoeficcient = dragCoeficcient;
        this.color = color ? color : this.color;
    }

    display(state: ICanvasState) {
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.rect(this.x, this.y, this.width, this.height);
            state.ctx.fillStyle = this.color;
            state.ctx.fillRect(this.x, this.y, this.width, this.height);
            state.ctx.stroke();
        }
    }
}
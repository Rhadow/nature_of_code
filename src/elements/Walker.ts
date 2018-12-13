import CreatureInterface from './CreatureInterface';
import { CanvasState } from '../components/Canvas/CanvasInterfaces';

export default class Walker implements CreatureInterface {
    protected x: number;
    protected y: number;
    protected lastX: number;
    protected lastY: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
    }

    step(): void {
        this.lastX = this.x;
        this.lastY = this.y;
        this.x += Math.random() * 2.1 - 1;
        this.y += Math.random() * 2.1 - 1;
    }

    display(state: CanvasState): void {
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.moveTo(this.lastX, this.lastY);
            state.ctx.lineTo(this.x, this.y);
            state.ctx.stroke();
        }
    }
}
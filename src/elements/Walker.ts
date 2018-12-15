import {ICreature} from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { monteCarloRandom } from '../utils/math';
import { perlin2, seed } from '../utils/noise';

export default class Walker implements ICreature {
    protected x: number;
    protected y: number;
    protected lastX: number;
    protected lastY: number;
    protected tx: number = 0;
    protected ty: number = 1000;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        seed(Math.random());
    }

    step(state: Readonly<ICanvasState>): void {
        this.lastX = this.x;
        this.lastY = this.y;
        // Use Monte Carlo Noise
        // const stepSize: number = monteCarloRandom() * 10;
        // Use Perlin Noise
        const stepSize: number = perlin2(this.tx++ / 100, this.tx++ / 100) * 10;
        this.x += Math.random() * 2 * stepSize - stepSize;
        this.y += Math.random() * 2 * stepSize - stepSize;
    }

    display(state: ICanvasState): void {
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.moveTo(this.lastX, this.lastY);
            state.ctx.lineTo(this.x, this.y);
            state.ctx.stroke();
        }
    }
}
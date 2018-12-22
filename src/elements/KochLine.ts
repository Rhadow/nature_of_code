import * as numjs from 'numjs';
import { IEnvironment } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';

type Vector = nj.NdArray;

export default class KochLine implements IEnvironment {
    constructor(public start: Vector, public end: Vector) {}
    display(state: ICanvasState) {
        if (state.ctx) {
            state.ctx.fillStyle = '#000000';
            state.ctx.beginPath();
            state.ctx.moveTo(this.start.get(0), this.start.get(1));
            state.ctx.lineTo(this.end.get(0), this.end.get(1));
            state.ctx.stroke();
        }
    }
}
import * as numjs from 'numjs';
import { IPath } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { getCoordinateAfterRotation } from '../utils/math';

export default class Path implements IPath {
    constructor(public start: nj.NdArray, public end: nj.NdArray, public radius: number) {}

    display(state: Readonly<ICanvasState>) {
        if (state.ctx) {
            const sx = this.start.get(0);
            const sy = this.start.get(1);
            const ex = this.end.get(0);
            const ey = this.end.get(1);
            state.ctx.lineWidth = this.radius * 2;
            state.ctx.strokeStyle = '#777777';
            state.ctx.beginPath();
            state.ctx.moveTo(sx, sy);
            state.ctx.lineTo(ex, ey);
            state.ctx.stroke();
            state.ctx.lineWidth = 3;
            state.ctx.strokeStyle = '#ffffff';
            state.ctx.setLineDash([25, 30]);
            state.ctx.beginPath();
            state.ctx.moveTo(sx, sy);
            state.ctx.lineTo(ex, ey);
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.setLineDash([]);
            state.ctx.strokeStyle = '#000000';
        }
    }
}
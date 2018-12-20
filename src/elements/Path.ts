import { IPath } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';

export default class Path implements IPath {
    public points: nj.NdArray[];
    constructor(points: nj.NdArray[], public radius: number) {
        if (points.length < 2) {
            throw new Error('Path needs at least two points!');
        }
        this.points = points;
    }

    display(state: Readonly<ICanvasState>) {
        if (state.ctx) {
            for (let i = 0; i < this.points.length - 1; i++) {
                const start = this.points[i];
                const end = this.points[i + 1];
                const sx = start.get(0);
                const sy = start.get(1);
                const ex = end.get(0);
                const ey = end.get(1);
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
}
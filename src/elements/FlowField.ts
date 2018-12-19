import { IFlowField } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { getCoordinateAfterRotation } from '../utils/math';

export default class FlowField implements IFlowField {
    private fields: nj.NdArray[][] = [[]];
    width: number;
    height: number;
    resolution: number;
    showFields: boolean = false;

    constructor(width: number, height: number, resolution: number, fieldFunction: (width: number, height: number, resolution: number)=>nj.NdArray[][], showFields: boolean) {
        this.width = width;
        this.height = height;
        this.resolution = resolution;
        this.fields = fieldFunction(width, height, resolution);
        this.showFields = showFields || this.showFields;
    }

    getField(location: nj.NdArray): nj.NdArray {
        const row = Math.floor(location.get(0) / this.resolution);
        const col = Math.floor(location.get(1) / this.resolution);
        return this.fields[Math.min(Math.max(0, row), this.fields.length - 1)][Math.min(Math.max(0, col), this.fields[0].length - 1)];
    }

    display(state: Readonly<ICanvasState>) {
        if (this.showFields && state.ctx) {
            for (let i = 0; i < this.fields.length; i++) {
                for (let j = 0; j < this.fields[i].length; j++) {
                    const field = this.fields[i][j];
                    const centerX = this.resolution * i + this.resolution / 2;
                    const centerY = this.resolution * j + this.resolution / 2;
                    const angle = Math.atan2(field.get(1), field.get(0));
                    const magnitude = this.resolution / 3;
                    const [cx, cy] = getCoordinateAfterRotation(centerX, centerY, angle);

                    state.ctx.beginPath();
                    state.ctx.rotate(angle);
                    state.ctx.moveTo(cx - magnitude, cy);
                    state.ctx.lineTo(cx + magnitude, cy);
                    state.ctx.lineTo(cx + magnitude - 5, cy + 5);
                    state.ctx.stroke();
                    state.ctx.beginPath();
                    state.ctx.moveTo(cx + magnitude, cy);
                    state.ctx.lineTo(cx + magnitude - 5, cy - 5);
                    state.ctx.stroke();
                    state.ctx.resetTransform();
                }
            }
        }
    }
}
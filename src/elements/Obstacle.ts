import { IObstacle, IPlacable } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';

type Vector = nj.NdArray;

export default class Obstacle implements IObstacle {
    private mainColor: string = '#0077be';
    private subColor: string = '#000000';

    constructor(public location: Vector, public width: number, public height: number, mainColor?: string, subColor?: string) {
        this.mainColor = mainColor ? mainColor : this.mainColor;
        this.subColor = subColor ? subColor : this.subColor;
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.fillStyle = this.mainColor;
            state.ctx.fillRect(x, y, this.width, this.height);
            state.ctx.stroke();
            state.ctx.fillStyle = '#ffffff';
        }
    }

    contains(creature: IPlacable): boolean {
        const itemX = creature.location.get(0);
        const itemY = creature.location.get(1);
        const x1 = this.location.get(0);
        const y1 = this.location.get(1);
        const x2 = x1 + this.width;
        const y2 = y1 + this.height;
        return itemX >= x1 && itemX <= x2 && itemY >= y1 && itemY <= y2
    }
}
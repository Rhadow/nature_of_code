import Walker from './Walker';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
export default class MouseWalker extends Walker {
    constructor(x: number, y: number) {
        super(x, y);
    }

    step(state: Readonly<ICanvasState>): void {
        this.lastX = this.x;
        this.lastY = this.y;
        const probDifference: number = 0.1;
        const stepSizeX: number = Math.random() * 2;
        const stepSizeY: number = Math.random() * 2;
        const {mouseX, mouseY} = state;
        const prob: number = Math.random();
        const downProb: number = 0.5 + ((mouseY > this.y) ? probDifference : -probDifference);
        const rightProb: number = 0.5 + ((mouseX > this.x) ? probDifference : -probDifference);
        this.y += (prob <= downProb) ? stepSizeY : -stepSizeY;
        this.x += (prob <= rightProb) ? stepSizeX : -stepSizeX;
    }
}
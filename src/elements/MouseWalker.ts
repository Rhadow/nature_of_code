import Walker from './Walker';
export default class MouseWalker extends Walker {
    constructor(x: number, y: number) {
        super(x, y);
    }

    step(): void {
        this.lastX = this.x;
        this.lastY = this.y;
    }
}
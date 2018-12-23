import * as numjs from 'numjs';
import { ILiving } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, getCoordinateAfterRotation, limit } from '../utils/math';
import SearcherDNA from './VectorDNA';

type Vector = nj.NdArray;

export default class Searcher implements ILiving<Vector> {
    velocity: Vector;
    location: Vector;
    dna: SearcherDNA;
    stopped: boolean = false;
    hasReachedTarget: boolean = false;
    private angle: number = 0;
    private size: number = 15;
    private acceleration: Vector;
    private mainColor: string = '#e2bf7d';
    private subColor: string = '#c3924f';

    constructor(location: Vector, dna: SearcherDNA, mainColor?: string, subColor?: string) {
        this.location = location;
        this.dna = dna;
        this.velocity = numjs.array([0, 0]);
        this.acceleration = numjs.array([0, 0]);
        this.mainColor = mainColor ? mainColor : this.mainColor;
        this.subColor = subColor ? subColor : this.subColor;
    }

    applyForce(force: Vector) {
        this.acceleration = this.acceleration.add(force);
    }

    step(state: ICanvasState): void {
        this.velocity = this.velocity.add(this.acceleration);
        this.location = this.location.add(this.velocity);
        this.angle = Math.atan2(this.velocity.get(1), this.velocity.get(0));
        this.acceleration = this.acceleration.multiply(0);
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        const [newX, newY] = getCoordinateAfterRotation(x, y, this.angle);
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.rotate(this.angle);
            state.ctx.moveTo(newX + this.size / 2, newY);
            state.ctx.lineTo(newX - this.size / 2, newY - this.size / 2);
            state.ctx.lineTo(newX - this.size / 4, newY);
            state.ctx.lineTo(newX - this.size / 2, newY + this.size / 2);
            state.ctx.lineTo(newX + this.size / 2, newY);
            state.ctx.fillStyle = this.mainColor;
            state.ctx.lineWidth = 2;
            state.ctx.strokeStyle = this.subColor;
            state.ctx.fill();
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.strokeStyle = '#000000';
            state.ctx.fillStyle = '#ffffff';
            state.ctx.resetTransform();
        }
    }

    run(state: ICanvasState): void {
        this.step(state);
        this.display(state);
    }

    fitness(target: Vector): number {
        const distance = magnitude(target.subtract(this.location));
        if (!this.hasReachedTarget && distance < 0.0001) {
            this.hasReachedTarget = true;
        }
        return 1 / (distance * distance) * (this.stopped ? 0.1 : 1) * (this.hasReachedTarget ? 1.1 : 1);
    }
}
import { IMover } from '../ElementInterface';
import { ICanvasState } from '../../components/Canvas/CanvasInterfaces';
import * as numjs from 'numjs';

export default class Mover implements IMover {
    velocity: nj.NdArray;
    mass: number;
    private location: nj.NdArray;
    private acceleration: nj.NdArray;
    private radius: number;
    private worldWidth: number;
    private worldHeight: number;

    constructor(mass: number, worldWidth: number, worldHeight: number, location?: nj.NdArray) {
        this.mass = mass;
        this.radius = mass * 10;
        this.location = location ? location : numjs.array([
            Math.random() * worldWidth / 2 + this.radius,
            Math.random() * worldHeight / 2 + this.radius
        ]);
        this.velocity = numjs.array([0, 0]);
        this.acceleration = numjs.array([0, 0]);
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    applyForce(force: nj.NdArray) {
        const accelerationCausedByForce = force.divide(this.mass);
        this.acceleration = this.acceleration.add(accelerationCausedByForce);
    }

    step(): void {
        this.velocity = this.velocity.add(this.acceleration);
        this.location = this.location.add(this.velocity);
        this.checkEdges();
        this.acceleration = this.acceleration.multiply(0);
    }

    display(state: ICanvasState): void {
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.arc(this.location.get(0), this.location.get(1), this.radius, 0, 2 * Math.PI);
            state.ctx.stroke();
        }
    }

    checkEdges(): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        const vx = this.velocity.get(0);
        const vy = this.velocity.get(1);
        let newX: number = x;
        let newY: number = y;
        let newVX: number = vx;
        let newVY: number = vy;
        if (x > (this.worldWidth - this.radius)) {
            newX = this.worldWidth - this.radius;
            newVX = -vx;
        }
        if (x < (this.radius)) {
            newX = this.radius;
            newVX = -vx;
        }
        if (y > (this.worldHeight - this.radius)) {
            newY = this.worldHeight - this.radius;
            newVY = -vy;
        }
        if (y < (this.radius)) {
            newY = this.radius;
            newVY = -vy;
        }
        this.location = numjs.array([newX, newY]);
        this.velocity = numjs.array([newVX, newVY]);
    }
}
import * as numjs from 'numjs';
import { IMover, ILiquid } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, normalize, getCoordinateAfterRotation } from '../utils/math';
import { G } from '../constants/world';

export default class Mover implements IMover {
    velocity: nj.NdArray;
    mass: number;
    frictionCoefficient: number = 0.01;
    location: nj.NdArray;
    angle: number = 0;
    private radius: number;
    protected acceleration: nj.NdArray;
    protected angleVelocity: number = 0;
    protected angleAcceleration: number = 0;
    protected worldWidth: number;
    protected worldHeight: number;
    protected mainColor: string = '#e2bf7d';
    protected subColor: string = '#c3924f';

    constructor(mass: number, worldWidth: number, worldHeight: number, location?: nj.NdArray, mainColor?: string, subColor?: string) {
        this.mass = mass;
        this.radius = mass * 2;
        this.location = location ? location : numjs.array([
            Math.random() * (worldWidth - this.radius * 2) + this.radius,
            Math.random() * (worldHeight - this.radius * 2) + this.radius
        ]);
        this.velocity = numjs.array([0, 0]);
        this.acceleration = numjs.array([0, 0]);
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.mainColor = mainColor ? mainColor : this.mainColor;
        this.subColor = subColor ? subColor : this.subColor;
    }

    applyForce(force: nj.NdArray) {
        const accelerationCausedByForce = force.divide(this.mass);
        this.acceleration = this.acceleration.add(accelerationCausedByForce);
    }

    step(state: ICanvasState): void {
        this.velocity = this.velocity.add(this.acceleration);
        this.location = this.location.add(this.velocity);
        this.angle = Math.atan2(this.velocity.get(1), this.velocity.get(0));
        this.checkEdges();
        this.acceleration = this.acceleration.multiply(0);
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        const [newX, newY] = getCoordinateAfterRotation(x, y, this.angle);
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.rotate(this.angle);
            state.ctx.arc(newX, newY, this.radius, 0, 2 * Math.PI);
            state.ctx.fillStyle = this.mainColor;
            state.ctx.fill();
            state.ctx.lineWidth = 3;
            state.ctx.strokeStyle = this.subColor;
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.strokeStyle = '#000000';
            state.ctx.resetTransform();
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

    drag(liquid: ILiquid): void {
        const v = magnitude(this.velocity);
        const dragMagnitude = 0.5 * v * v * liquid.dragCoeficcient;
        if (v > 0) {
            this.applyForce(normalize(this.velocity).multiply(-dragMagnitude));
        }
    }

    isInside(liquid: ILiquid): boolean {
        let result = false;
        const x = this.location.get(0);
        const y = this.location.get(1);
        const left = liquid.x;
        const right = liquid.x + liquid.width;
        const top = liquid.y;
        const bottom = liquid.y + liquid.height;
        if (x >= left && x <= right && y >= top && y <= bottom) {
            result = true;
        }
        return result;
    }

    attract(mover: Mover): nj.NdArray {
        const [minimumDistance, maximumDistance] = [5, 15];
        let force = this.location.subtract(mover.location);
        let r = Math.min(Math.max(minimumDistance, magnitude(force)), maximumDistance);
        let strength = G * this.mass * mover.mass / (r * r);
        return normalize(force).multiply(strength);
    }
}
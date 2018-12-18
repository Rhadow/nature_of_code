import * as numjs from 'numjs';
import { IRepeller } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, normalize } from '../utils/math';
import Particle from './Particle';

export default class Repeller implements IRepeller {
    mass: number;
    location: nj.NdArray;
    private radius: number;
    private G: number = 3;

    constructor(mass: number, location: nj.NdArray) {
        this.mass = mass;
        this.location = location;
        this.radius = this.mass * 2;
    }

    step(): void {
    }

    display(state: ICanvasState): void {
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.arc(this.location.get(0), this.location.get(1), this.radius, 0, 2 * Math.PI);
            state.ctx.fillStyle = '#f9d71c';
            state.ctx.fill();
            state.ctx.lineWidth = 3;
            state.ctx.strokeStyle = '#ffa716';
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.strokeStyle = '#000000';
        }
    }

    repel(particle: Particle): nj.NdArray {
        const [minimumDistance, maximumDistance] = [0.000000001, 300];
        let force = this.location.subtract(particle.location);
        let r = Math.min(Math.max(minimumDistance, magnitude(force)), maximumDistance);
        let strength = -this.G * this.mass * particle.mass / (r * r);
        return normalize(force).multiply(strength);
    }
}
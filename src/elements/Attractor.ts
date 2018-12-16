import * as numjs from 'numjs';
import { IAttractor } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, normalize } from '../utils/math';
import Mover from './Mover';
import { G } from '../constants/world';

export default class Attractor implements IAttractor {
    mass: number;
    location: nj.NdArray;
    private radius: number;

    constructor(mass: number, location: nj.NdArray) {
        this.mass = mass;
        this.location = location;
        this.radius = this.mass * 2;
    }

    step():void {
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

    attract(mover: Mover): nj.NdArray {
        const [minimumDistance, maximumDistance] = [5, 15];
        let force = this.location.subtract(mover.location);
        let r = Math.min(Math.max(minimumDistance, magnitude(force)), maximumDistance);
        let strength = G * this.mass * mover.mass / (r * r);
        return normalize(force).multiply(strength);
    }
}
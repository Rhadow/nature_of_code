import * as numjs from 'numjs';
import { IParticle } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { isNumber } from 'util';

export default class Particle implements IParticle {
    velocity: nj.NdArray;
    mass: number;
    location: nj.NdArray;
    lifespan: number = 255;
    initialLifespan: number;
    private radius: number;
    protected acceleration: nj.NdArray;
    protected mainColor: string = '#e2bf7d';
    protected subColor: string = '#c3924f';

    constructor(mass: number, location: nj.NdArray, lifespan?: number, mainColor?: string, subColor?: string) {
        this.mass = mass;
        this.radius = mass * 2;
        this.location = location;
        this.velocity = numjs.array([0, 0]);
        this.acceleration = numjs.array([0, 0]);
        this.mainColor = mainColor ? mainColor : this.mainColor;
        this.subColor = subColor ? subColor : this.subColor;
        this.lifespan = (isNumber(lifespan) && !isNaN(lifespan)) ? lifespan : this.lifespan;
        this.initialLifespan = (isNumber(lifespan) && !isNaN(lifespan)) ? lifespan : this.lifespan;
    }

    applyForce(force: nj.NdArray) {
        const accelerationCausedByForce = force.divide(this.mass);
        this.acceleration = this.acceleration.add(accelerationCausedByForce);
    }

    run(state: ICanvasState): void {
        this.step(state);
        this.display(state);
    }

    step(state: ICanvasState): void {
        this.velocity = this.velocity.add(this.acceleration);
        this.location = this.location.add(this.velocity);
        this.acceleration = this.acceleration.multiply(0);
        this.lifespan -= 2.5;
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        if (state.ctx) {
            state.ctx.globalAlpha = Math.max(this.lifespan / this.initialLifespan, 0);
            state.ctx.beginPath();
            state.ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
            state.ctx.fillStyle = this.mainColor;
            state.ctx.fill();
            state.ctx.lineWidth = 3;
            state.ctx.strokeStyle = this.subColor;
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.strokeStyle = '#000000';
            state.ctx.resetTransform();
            state.ctx.globalAlpha = 1;
        }
    }

    isAlive() {
        return this.lifespan > 0;
    }
}
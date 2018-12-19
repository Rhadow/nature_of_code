import * as numjs from 'numjs';
import { IMover } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { getCoordinateAfterRotation } from '../utils/math';
import Mover from './Mover';

export default class Rocket extends Mover implements IMover {
    private size: number;
    constructor(mass: number, location: nj.NdArray, mainColor?: string, subColor?: string) {
        super(mass, location, mainColor, subColor);
        this.size = this.mass * 2;
        this.frictionCoefficient = 0.1;
    }

    step(state: ICanvasState): void {
        this.velocity = this.velocity.add(this.acceleration);
        this.location = this.location.add(this.velocity);
        this.checkEdges(state.worldWidth, state.worldHeight);
        this.acceleration = this.acceleration.multiply(0);
    }

    display(state: ICanvasState): void {
        const [newX, newY] = getCoordinateAfterRotation(this.location.get(0), this.location.get(1), this.angle);
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.rotate(this.angle);

            // Draw triangle
            state.ctx.moveTo(newX, newY);
            state.ctx.lineTo(newX - this.size, newY - this.size);
            // Draw body
            state.ctx.lineTo(newX-this.size*4, newY - this.size);
            state.ctx.lineTo(newX - this.size*4, newY + this.size);
            state.ctx.lineTo(newX - this.size, newY + this.size);
            // state.ctx.lineTo(newX - this.size, newY - this.size);


            state.ctx.fillStyle = this.mainColor;
            state.ctx.fill();
            state.ctx.lineWidth = 3;
            state.ctx.strokeStyle = this.subColor;
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.fillStyle = '#000000';
            state.ctx.strokeStyle = '#000000';
            state.ctx.resetTransform();
        }
    }

    checkEdges(worldWidth: number, worldHeight: number): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        let newX: number = x;
        let newY: number = y;
        if (x > worldWidth) {
            newX = 0;
        }
        if (x < 0) {
            newX = worldWidth;
        }
        if (y > worldHeight) {
            newY = 0;
        }
        if (y < 0) {
            newY = worldHeight;
        }
        this.location = numjs.array([newX, newY]);
    }
}
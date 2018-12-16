import * as numjs from 'numjs';
import { IPendulum } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { isNumber } from 'util';

export default class Pendulum implements IPendulum {
    location: nj.NdArray;
    armLength: number;
    angle: number = Math.PI / 4;
    private angularVelocity: number = 0;
    private damping: number = 0.995;
    private pivotSize: number = 15;
    private radius: number = 20;
    constructor(location: nj.NdArray, armLength: number, initialAngle?: number) {
        this.location = location;
        this.armLength = armLength;
        this.angle = isNumber(initialAngle) ? initialAngle : this.angle;
    }

    step(state: ICanvasState): void {
        const gravity = 0.4;
        const angularAcceleration = (-gravity / this.armLength) * Math.sin(this.angle);
        this.angularVelocity += angularAcceleration;
        this.angle += this.angularVelocity;
        this.angularVelocity *= this.damping;
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        const pivotX = x - this.pivotSize / 2;
        const pivotY = y - this.pivotSize / 2;
        const bobX = x + this.armLength * Math.sin(this.angle);
        const bobY = y + this.armLength * Math.cos(this.angle);

        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.fillStyle = '#595a4f';
            state.ctx.rect(pivotX, pivotY, this.pivotSize, this.pivotSize);
            state.ctx.fill();
            state.ctx.moveTo(x, y);
            state.ctx.lineTo(bobX, bobY);
            state.ctx.stroke();
            state.ctx.beginPath();
            state.ctx.arc(bobX, bobY, this.radius, 0, 2 * Math.PI);
            state.ctx.fill();
            state.ctx.stroke();
            state.ctx.fillStyle = '#000000';
        }
    }
}
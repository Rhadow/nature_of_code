import * as numjs from 'numjs';
import { ISpring } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import Mover from './Mover';
import { magnitude } from '../utils/math';
import { normalize } from '../utils/math';
import { isNumber } from 'util';

export default class Spring implements ISpring {
    location: nj.NdArray;
    restArmLength: number;
    private currentArmLength: number = 0;
    private K: number = 0.1;
    private pivotSize: number = 15;
    private bob: Mover | null = null;

    constructor(location: nj.NdArray, restArmLength: number, K?: number) {
        this.location = location;
        this.restArmLength = restArmLength;
        this.K = (isNumber(K) && !isNaN(K)) ? K : this.K;
    }

    connect(bob: Mover) {
        this.bob = bob;
        const force = bob.location.subtract(this.location);
        this.currentArmLength = magnitude(force);
        const normalizedForce = normalize(force);
        const strength = -this.K * (this.currentArmLength - this.restArmLength);
        bob.applyForce(normalizedForce.multiply(strength));
    }

    step(state: ICanvasState): void {}

    display(state: ICanvasState): void {
        if (this.bob) {
            const x = this.location.get(0);
            const y = this.location.get(1);
            const pivotX = x - this.pivotSize / 2;
            const pivotY = y - this.pivotSize / 2;
            const bobX = this.bob.location.get(0);
            const bobY = this.bob.location.get(1);

            if (state.ctx) {
                state.ctx.beginPath();
                state.ctx.fillStyle = '#595a4f';
                state.ctx.rect(pivotX, pivotY, this.pivotSize, this.pivotSize);
                state.ctx.fill();
                state.ctx.moveTo(x, y);
                state.ctx.lineTo(bobX, bobY);
                state.ctx.stroke();
                state.ctx.fillStyle = '#000000';
            }
        }
    }
}
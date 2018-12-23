import * as numjs from 'numjs';
import { ILiving, IDNA, IEnvironment } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, limit, mapping, monteCarloRandom } from '../utils/math';

type Vector = nj.NdArray;

export class BloopDNA implements IDNA<number> {
    genes: number[];
    constructor(public mass: number) {
        this.genes = [mass];
    }
    crossover(partner: BloopDNA): BloopDNA {
        const newDna = new BloopDNA(this.genes[0]);
        return newDna;
    }
    mutate(mutationRate: number) {
        if (Math.random() < mutationRate) {
            const originalMass = this.genes[0];
            this.genes[0] = mapping(Math.random(), 0, 1, 0.5 * originalMass, 5 * originalMass);
        }
    }
}

export class BloopFood implements IEnvironment {
    public health: number;
    private mainColor: string = '#c1440e';
    constructor(public location: Vector, public width: number) {
        this.health = this.width;
    }
    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.fillStyle = this.mainColor;
            state.ctx.fillRect(x + this.width / 2, y + this.width / 2, this.width, this.width);
            state.ctx.stroke();
            state.ctx.fillStyle = '#ffffff';
        }
    }
}

export default class Bloop implements ILiving<number> {
    velocity: Vector;
    stopped: boolean = false;
    hasReachedTarget: boolean = false;
    mass: number;
    private fullHealth: number = 600;
    private health: number = this.fullHealth;
    private mainColor: string = '#e2bf7d';
    private subColor: string = '#c3924f';

    constructor(public location: Vector, public dna: BloopDNA, public maxForce: number, mainColor?: string, subColor?: string) {
        this.velocity = numjs.array([0, 0]);
        this.mass = dna.genes[0];
        this.mainColor = mainColor ? mainColor : this.mainColor;
        this.subColor = subColor ? subColor : this.subColor;
    }

    applyForce(force: Vector) {}

    step(state: ICanvasState): void {
        const acceleration = numjs.array([
            mapping(Math.random(), 0, 1, -1, 1) * this.maxForce,
            mapping(Math.random(), 0, 1, -1, 1) * this.maxForce,
        ]);
        this.velocity = this.velocity.add(acceleration);
        this.velocity = limit(this.velocity, 4000 / (this.mass * this.mass));
        this.location = this.location.add(this.velocity);
        this.checkEdges(state.worldWidth, state.worldHeight);
        this.health--;
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        if (state.ctx) {
            state.ctx.globalAlpha = Math.max(this.health / this.fullHealth, 0);
            state.ctx.beginPath();
            state.ctx.arc(x, y, this.mass, 0, 2 * Math.PI);
            state.ctx.fillStyle = this.mainColor;
            state.ctx.lineWidth = 2;
            state.ctx.strokeStyle = this.subColor;
            state.ctx.fill();
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.strokeStyle = '#000000';
            state.ctx.fillStyle = '#ffffff';
            state.ctx.globalAlpha = 1;
        }
    }

    run(state: ICanvasState): void {
        this.step(state);
        this.display(state);
    }

    fitness(target: number): number {
        return 1;
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

    isDead(): boolean {
        return this.health <= 0;
    }

    eat(food: BloopFood) {
        this.health += (food.health * 10);
    }
}
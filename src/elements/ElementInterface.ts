import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import Mover from './Mover';
import Particle from './Particle';

export interface IEnvironment {
    display(state: Readonly<ICanvasState>): void;
}

export interface ICreature extends IEnvironment {
    step(state?: Readonly<ICanvasState>):void;
}

export interface ILiquid extends IEnvironment {
    x: number;
    y: number;
    width: number;
    height: number;
    dragCoeficcient: number;
}

export interface IPlacable {
    location: nj.NdArray;
}

export interface IMovable {
    velocity: nj.NdArray;
    applyForce(force: nj.NdArray): void;
}

export interface IItem extends IPlacable {
    mass: number;
}

export interface IAttractor extends ICreature, IItem {
    attract(mover: Mover): nj.NdArray
}

export interface IRepeller extends ICreature, IItem {
    repel(mover: Particle): nj.NdArray
}

export interface IRunnable {
    run(state: Readonly<ICanvasState>): void;
}

export interface IMover extends IAttractor, IMovable {
    frictionCoefficient: number;
    checkEdges(): void;
    drag(liquid: ILiquid): void;
    isInside(liquid: ILiquid): boolean;
}

export interface IPendulum extends ICreature, IPlacable {
    armLength: number;
}

export interface ISpring extends ICreature, IPlacable {
    restArmLength: number;
    connect(bob: Mover): void
}

export interface IParticle extends ICreature, IPlacable, IMovable, IItem, IRunnable {
    lifespan: number;
    isAlive(): boolean;
}

export interface IParticleSystem extends ICreature, IPlacable, IMovable, IRunnable {
    particles: Particle[];
    maxParticles: number;
    addParticle(): void;
    applyForceToParticles(force: nj.NdArray): void;
}
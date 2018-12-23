import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import Mover from './Mover';
import Particle from './Particle';

type Vector = nj.NdArray;

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

export interface IEdgeChecker {
    checkEdges(worldWidth: number, worldHeight: number): void;
}

export interface IMover extends IAttractor, IMovable, IEdgeChecker {
    frictionCoefficient: number;
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

export interface IParticle extends ICreature, IMovable, IItem, IRunnable {
    lifespan: number;
    isAlive(): boolean;
}

export interface IParticleSystem extends ICreature, IPlacable, IMovable, IRunnable {
    particles: Particle[];
    maxParticles: number;
    addParticle(): void;
    applyForceToParticles(force: nj.NdArray): void;
}

export interface IVehicle extends ICreature, IMovable, IItem, IEdgeChecker {
    maxVelocity: number;
    maxSteeringForce: number;
    seek(location: nj.NdArray): void;
}

export interface IFlowField extends IEnvironment {
    getField(location: nj.NdArray): nj.NdArray
}

export interface IPath extends IEnvironment {
    points: nj.NdArray[];
    radius: number;
}

export interface IDNA<T> {
    genes: T[];
    crossover(partner: IDNA<T>): IDNA<T>;
    mutate(mutationRate: number): void;
}

export interface ILiving<T> extends ICreature, IMovable, IRunnable {
    dna: IDNA<T>;
    stopped: boolean;
    hasReachedTarget: boolean;
    fitness(target: T): number;
}

export interface IPopulation<T> {
    fitness(target: T): void;
    selection(): void;
    reproduction(): void;
}

export interface IObstacle extends IEnvironment {
    contains(creature: IPlacable): boolean
}

export interface IBloop extends ILiving<number>, IEdgeChecker {
    isDead(): boolean;
}
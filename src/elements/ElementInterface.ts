import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import Mover from './Mover';

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

export interface IItem extends IPlacable {
    mass: number;
}

export interface IAttractor extends ICreature, IItem {
    attract(mover: Mover): nj.NdArray
}

export interface IMover extends IAttractor {
    velocity: nj.NdArray;
    frictionCoefficient: number;
    applyForce(force: nj.NdArray): void;
    checkEdges(): void;
    drag(liquid: ILiquid): void;
    isInside(liquid: ILiquid): boolean;
}

export interface IPendulum extends ICreature, IPlacable {
    armLength: number
}
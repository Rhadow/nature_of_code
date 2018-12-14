import { ICanvasState } from '../components/Canvas/CanvasInterfaces';

export interface ICreatureInterface {
    step(state?: Readonly<ICanvasState>):void;
    display(state: Readonly<ICanvasState>):void;
}

export interface IMover extends ICreatureInterface {
    applyForce(force: nj.NdArray): void;
    checkEdges(): void;
}
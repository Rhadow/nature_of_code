import { CanvasState } from '../components/Canvas/CanvasInterfaces';

export default interface CreatureInterface {
    step(state?: Readonly<CanvasState>):void;
    display(state: Readonly<CanvasState>):void;
}
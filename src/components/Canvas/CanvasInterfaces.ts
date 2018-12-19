import { ICreature, IEnvironment } from "../../elements/ElementInterface";

export interface ICanvasProps {
    width: number;
    height: number;
    currentPage: string;
}

export interface ICanvasState {
    ctx: CanvasRenderingContext2D | null;
    currentFrame: number;
    mouseX: number;
    mouseY: number;
    pressedKey: string;
    worldWidth: number;
    worldHeight: number;
    currentCreatures: ICreature[];
    currentEnvironment: IEnvironment[];
}
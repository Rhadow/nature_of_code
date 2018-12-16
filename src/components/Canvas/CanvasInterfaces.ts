import { ICreature, IEnvironment } from "../../elements/ElementInterface";

export interface ICanvasProps {
    width: number;
    height: number;
    currentPage: string;
}

export interface ICanvasState {
    ctx: CanvasRenderingContext2D | null;
    mouseX: number;
    mouseY: number;
    pressedKey: string;
    currentCreatures: ICreature[];
    currentEnvironment: IEnvironment[];
}
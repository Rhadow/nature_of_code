import CreatureInterface from "../../elements/CreatureInterface";

export interface CanvasProps {
    width: number;
    height: number;
    currentPage: string;
}

export interface CanvasState {
    ctx: CanvasRenderingContext2D | null;
    mouseX: number;
    mouseY: number;
    currentCreatures: CreatureInterface[];
}
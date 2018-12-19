import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";

const defaultForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    creatures.forEach((creature: ICreature) => {
        creature.step(canvasState);
        creature.display(canvasState);
    });
}

export default defaultForceFunction;

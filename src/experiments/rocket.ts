import * as numjs from 'numjs';
import { magnitude, normalize } from '../utils/math';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import { width, height } from '../constants/world';
import Rocket from '../elements/Rocket';

const rocketForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const thrustForce: number = 1;
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    creatures.forEach((creature: ICreature) => {
        if (creature instanceof Rocket) {
            // Apply friction
            const frictionNormalForce = 1;
            let friction = numjs.array([0, 0]);
            if (magnitude(creature.velocity) !== 0) {
                friction = normalize(creature.velocity);
            }
            creature.applyForce(friction.multiply(-creature.frictionCoefficient * frictionNormalForce));
            switch (canvasState.pressedKey) {
                case 'ArrowLeft':
                    creature.angle -= 0.03;
                    break;
                case 'ArrowRight':
                    creature.angle += 0.03;
                    break;
                case 'ArrowUp':
                    creature.applyForce(numjs.array([thrustForce * Math.cos(creature.angle), thrustForce * Math.sin(creature.angle)]));
                    break;
                case 'ArrowDown':
                    creature.applyForce(numjs.array([-thrustForce * Math.cos(creature.angle), -thrustForce * Math.sin(creature.angle)]));
                    break;
            }
        }
        creature.step(canvasState);
        creature.display(canvasState);
    });
}

export const rocketExperiment = {
    'label': 'Rocket',
    'creatures': [
        new Rocket(15, numjs.array([width / 2, height / 2]), '#c1440e', '#e77d11'),
    ],
    'environments': [],
    'forceFunction': rocketForceFunction,
    'initialForceFunction': () => { }
};
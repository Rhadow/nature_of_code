import * as numjs from 'numjs';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import { width, height } from '../constants/world';
import Pendulum from '../elements/Pendulum';
import Spring from '../elements/Spring';
import Mover from '../elements/Mover';
import Liquid from '../elements/Liquid';

const pendulumForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    const pendulumOne: Pendulum = <Pendulum>creatures[0];
    const pendulumTwo: Pendulum = <Pendulum>creatures[1];

    pendulumOne.step(canvasState);

    const x = pendulumOne.location.get(0);
    const y = pendulumOne.location.get(1);

    pendulumTwo.location = numjs.array(
        [
            x + pendulumOne.armLength * Math.sin(pendulumOne.angle),
            y + pendulumOne.armLength * Math.cos(pendulumOne.angle),
        ]
    );
    pendulumTwo.step(canvasState);
    pendulumOne.display(canvasState);
    pendulumTwo.display(canvasState);
}

const springForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    const gravity: numjs.NdArray = numjs.array([0, 1]);
    const spring: Spring = <Spring>creatures[0];
    const bob: Mover = <Mover>creatures[1];
    const air: Liquid = <Liquid>currentEnvironment[0];
    bob.applyForce(gravity);
    spring.connect(bob);
    bob.drag(air);
    bob.step(canvasState);
    spring.display(canvasState);
    bob.display(canvasState);
}


export const pendulumExperiment = {
    'label': 'Pendulum',
    'creatures': [
        new Pendulum(numjs.array([width / 2, 20]), 125),
        new Pendulum(numjs.array([width / 2, 20]), 125, Math.PI / 2)
    ],
    'environments': [],
    'forceFunction': pendulumForceFunction,
    'initialForceFunction': () => { }
};

export const springExperiment = {
    'label': 'Spring',
    'creatures': [
        new Spring(numjs.array([width / 2, 20]), 125),
        new Mover(15, numjs.array([width / 2 + 50, 60]))
    ],
    'environments': [
        new Liquid(0, 0, width, height, 0.1, '#ffffff')
    ],
    'forceFunction': springForceFunction,
    'initialForceFunction': () => { }
};


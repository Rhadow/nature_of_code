import * as numjs from 'numjs';
import { magnitude, normalize } from '../utils/math';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment, IPendulum } from "../elements/ElementInterface";
import { width, height } from './world';
import Walker from '../elements/Walker';
import MouseWalker from '../elements/MouseWalker';
import Mover from '../elements/Mover';
import Liquid from '../elements/Liquid';
import Attractor from '../elements/Attractor';
import Rocket from '../elements/Rocket';
import Pendulum from '../elements/Pendulum';

const generateMovers = (): Mover[] => {
    const movers: Mover[] = [];
    const numOfMovers: number = 5;
    const minMass = 5;
    const maxMass = 10;
    for (let i = 0; i < numOfMovers; i++) {
        const moverMass = Math.random() * (maxMass - minMass) + minMass;
        movers.push(
            new Mover(moverMass, width, height, numjs.array([
                Math.random() * (width - moverMass * 4) + moverMass * 2,
                maxMass * 2
            ]))
        )
    }
    return movers;
}

const defaultForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    creatures.forEach((creature: ICreature) => {
        creature.step(canvasState);
        creature.display(canvasState);
    });
}

const moverForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const gravity: nj.NdArray = numjs.array([0, 0.2]);
    const wind: nj.NdArray = numjs.array([0.001, 0]);
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    creatures.forEach((creature: ICreature) => {
        if (creature instanceof Mover) {
            // Apply friction
            const frictionNormalForce = 1;
            let friction = numjs.array([0, 0]);
            if (magnitude(creature.velocity) !== 0) {
                friction = normalize(creature.velocity);
            }
            creature.applyForce(friction.multiply(-creature.frictionCoefficient * frictionNormalForce));
            // Apply drag force
            currentEnvironment.forEach((environment: IEnvironment) => {
                if (environment instanceof Liquid && creature.isInside(environment)) {
                    creature.drag(environment);
                }
            });
            // Apply other forces
            creature.applyForce(gravity.multiply(creature.mass));
            creature.applyForce(wind);
        }
        creature.step(canvasState);
        creature.display(canvasState);
    });
}

const attractorForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const movers: Mover[] = <Mover[]>creatures;

    movers.forEach((attractor: Mover, i: number) => {
        movers.forEach((mover: Mover, j: number) => {
            if (i !== j) {
                const attractForce = attractor.attract(mover);
                mover.applyForce(attractForce);
            }
        });
    });

    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    creatures.forEach((creature: ICreature) => {
        creature.step(canvasState);
        creature.display(canvasState);
    });
}

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

export const defaultPage = 'pendulum';

export interface IPageLabelMapping {
    'walker': string;
    'mousewalker': string;
    'mover': string,
    'attractor': string,
    'rocket': string,
    'pendulum': string,
    [key: string]: string;
}

export const pages: string[] = [
    'walker',
    'mousewalker',
    'mover',
    'attractor',
    'rocket',
    'pendulum'
];

interface IExperiment {
    label: string;
    creatures: ICreature[];
    environments: IEnvironment[];
    forceFunction: (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => void;
}

export const experiments: {[K in keyof IPageLabelMapping]:IExperiment} = {
    'walker': {
        'label': 'Walker',
        'creatures': [
            new Walker(width / 2, height / 2),
        ],
        'environments': [],
        'forceFunction': defaultForceFunction
    },
    'mousewalker': {
        'label': 'Mouse Walker',
        'creatures': [
            new MouseWalker(width / 2, height / 2),
        ],
        'environments': [],
        'forceFunction': defaultForceFunction
    },
    'mover': {
        'label': 'Mover',
        'creatures': generateMovers(),
        'environments': [new Liquid(0, height / 1.5, width, height / 1.5, 1)],
        'forceFunction': moverForceFunction
    },
    'attractor': {
        'label': 'Attractor',
        'creatures': [
            new Mover(50, width, height, numjs.array([width / 2, height / 2]), '#f9d71c', '#ffa716'),
            new Mover(15, width, height, numjs.array([180, height / 2])),
            new Mover(10, width, height, numjs.array([width - 250, 330]), '#6b93d6', '#298487'),
            new Mover(12, width, height, numjs.array([width - 200, 120]), '#c1440e', '#e77d11')
        ],
        'environments': [],
        'forceFunction': attractorForceFunction
    },
    'rocket': {
        'label': 'Rocket',
        'creatures': [
            new Rocket(15, width, height, numjs.array([width / 2, height / 2]), '#c1440e', '#e77d11'),
        ],
        'environments': [],
        'forceFunction': rocketForceFunction
    },
    'pendulum': {
        'label': 'Pendulum',
        'creatures': [
            new Pendulum(numjs.array([width / 2, 20]), 125),
            new Pendulum(numjs.array([width / 2, 20]), 125, Math.PI / 2),
        ],
        'environments': [],
        'forceFunction': pendulumForceFunction
    }
}

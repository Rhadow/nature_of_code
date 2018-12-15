import * as numjs from 'numjs';
import { magnitude, normalize } from '../utils/math';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import Walker from '../elements/Walker';
import MouseWalker from '../elements/MouseWalker';
import Mover from '../elements/Mover';
import Liquid from '../elements/Liquid';
import Attractor from '../elements/Attractor';

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
    const attractors: Attractor[] = [];
    const movers: Mover[] = [];
    const initialPushForces: nj.NdArray[] = [
        numjs.array([15, 0]),
        numjs.array([-16, 0]),
    ];

    for (let i = 0; i < creatures.length; i++) {
        if (creatures[i] instanceof Attractor) {
            attractors.push(<Attractor>creatures[i]);
        } else if (creatures[i] instanceof Mover) {
            movers.push(<Mover>creatures[i]);
        }
    }

    attractors.forEach((attractor: Attractor) => {
        movers.forEach((mover: Mover, i: number) => {
            const attractForce = attractor.attract(mover);
            if (magnitude(mover.velocity) === 0) {
                mover.applyForce(initialPushForces[i]);
            }
            mover.applyForce(attractForce);
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

export const defaultPage = 'attractor';

export interface IPageLabelMapping {
    'walker': string;
    'mousewalker': string;
    'mover': string,
    'attractor': string,
    [key: string]: string;
}

export const width: number = 960;
export const height: number = 480;
export const pages: string[] = [
    'walker',
    'mousewalker',
    'mover',
    'attractor'
];

export const pageLabelMapping: IPageLabelMapping = {
    'walker': 'Walker',
    'mousewalker': 'Mouse Walker',
    'mover': 'Mover',
    'attractor': 'Attractor'
};

export const pageCreatureMapping: { [key in keyof IPageLabelMapping]: ICreature[] } = {
    'walker': [
        new Walker(width / 2, height / 2),
    ],
    'mousewalker': [
        new MouseWalker(width / 2, height / 2),
    ],
    'mover': generateMovers(),
    'attractor':[
        new Attractor(20, numjs.array([width / 2, height / 2])),
        new Mover(5, width, height, numjs.array([width / 2, 150])),
        new Mover(5, width, height, numjs.array([width / 2 + 20, 330]), '#6b93d6', '#298487')
    ]
};

export const pageEnvironmentMapping: { [key in keyof IPageLabelMapping]: IEnvironment[] } = {
    'walker': [],
    'mousewalker': [],
    'mover': [new Liquid(0, height / 1.5, width, height / 1.5, 1)],
    'attractor': []
};

export const pageForceFunctionMapping: { [key in keyof IPageLabelMapping]: (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => void} = {
    'walker': defaultForceFunction,
    'mousewalker': defaultForceFunction,
    'mover': moverForceFunction,
    'attractor': attractorForceFunction
};

import * as numjs from 'numjs';
import { magnitude, normalize } from '../utils/math';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import { width, height } from '../constants/world';
import Mover from '../elements/Mover';
import Liquid from '../elements/Liquid';

const generateMovers = (): Mover[] => {
    const movers: Mover[] = [];
    const numOfMovers: number = 5;
    const minMass = 5;
    const maxMass = 10;
    for (let i = 0; i < numOfMovers; i++) {
        const moverMass = Math.random() * (maxMass - minMass) + minMass;
        movers.push(
            new Mover(moverMass, numjs.array([
                Math.random() * (width - moverMass * 4) + moverMass * 2,
                maxMass * 2
            ]))
        )
    }
    return movers;
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


export const moverExperiment = {
    'label': 'Mover',
    'creatures': generateMovers(),
    'environments': [new Liquid(0, height / 1.5, width, height / 1.5, 1)],
    'forceFunction': moverForceFunction,
    'initialForceFunction': () => { }
};

export const attractorExperiment = {
    'label': 'Attractor',
    'creatures': [
        new Mover(50, numjs.array([width / 2, height / 2]), '#f9d71c', '#ffa716'),
        new Mover(15, numjs.array([180, height / 2])),
        new Mover(10, numjs.array([width - 250, 330]), '#6b93d6', '#298487'),
        new Mover(12, numjs.array([width - 200, 120]), '#c1440e', '#e77d11')
    ],
    'environments': [],
    'forceFunction': attractorForceFunction,
    'initialForceFunction': () => { }
};
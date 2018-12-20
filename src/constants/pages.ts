import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import {rocketExperiment} from '../experiments/rocket';
import {walkerExperiment, mouseWalkerExperiment} from '../experiments/walker';
import {moverExperiment, attractorExperiment} from '../experiments/mover';
import {pendulumExperiment, springExperiment} from '../experiments/pendulum';
import {particleExperiment} from '../experiments/particle';
import { vehicleExperiment, flowFieldExperiment, pathExperiment, groupExperiment, flockExperiment} from '../experiments/vehicle';

export const defaultPage = 'flock';

export interface IPageLabelMapping {
    'walker': string;
    'mousewalker': string;
    'mover': string,
    'attractor': string,
    'rocket': string,
    'pendulum': string,
    'spring': string,
    'particle': string,
    'vehicle': string,
    'flowField': string,
    'path': string,
    'group': string,
    'flock': string,
    [key: string]: string;
}

export const pages: string[] = [
    'walker',
    'mousewalker',
    'mover',
    'attractor',
    'rocket',
    'pendulum',
    'spring',
    'particle',
    'vehicle',
    'flowField',
    'path',
    'group',
    'flock'
];

interface IExperiment {
    label: string;
    creatures: ICreature[];
    environments: IEnvironment[];
    forceFunction: (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => void;
    initialForceFunction: (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => void;
}

export const experiments: {[K in keyof IPageLabelMapping]:IExperiment} = {
    'walker': walkerExperiment,
    'mousewalker': mouseWalkerExperiment,
    'mover': moverExperiment,
    'attractor': attractorExperiment,
    'rocket': rocketExperiment,
    'pendulum': pendulumExperiment,
    'spring': springExperiment,
    'particle': particleExperiment,
    'vehicle': vehicleExperiment,
    'flowField': flowFieldExperiment,
    'path': pathExperiment,
    'group': groupExperiment,
    'flock': flockExperiment
}

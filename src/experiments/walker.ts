import { width, height } from '../constants/world';
import defaultForceFunction from './defaultForceFunction';
import Walker from '../elements/Walker';
import MouseWalker from '../elements/MouseWalker';

export const walkerExperiment = {
    'label': 'Walker',
    'creatures': [
            new Walker(width / 2, height / 2),
        ],
    'environments': [],
    'forceFunction': defaultForceFunction,
    'initialForceFunction': () => { }
};

export const mouseWalkerExperiment = {
    'label': 'Mouse Walker',
    'creatures': [
        new MouseWalker(width / 2, height / 2),
    ],
    'environments': [],
    'forceFunction': defaultForceFunction,
    'initialForceFunction': () => { }
};
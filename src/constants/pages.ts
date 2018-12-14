
import {ICreatureInterface} from "../elements/ElementInterface";
import Walker from '../elements/Walker';
import MouseWalker from '../elements/MouseWalker';
import Mover from '../elements/Mover/Mover';
import * as numjs from 'numjs';

export interface IPageLabelMapping {
    'walker': string;
    'mousewalker': string;
    'mover': string,
    [key: string]: string;
}

export const width: number = 640;
export const height: number = 360;
export const pages: string[] = [
    'walker',
    'mousewalker',
    'mover'
];

export const pageLabelMapping: IPageLabelMapping = {
    'walker': 'Walker',
    'mousewalker': 'Mouse Walker',
    'mover': 'Mover'
};

const movers: Mover[] = [];
const numOfMovers: number = 3;
const minMass = 1;
const maxMass = 5;
for (let i = 0; i < numOfMovers; i++) {
    movers.push(
        new Mover(Math.random() * maxMass + minMass, width, height)
    );
}

export const pageCreatureMapping: { [key in keyof IPageLabelMapping]: ICreatureInterface[] } = {
    'walker': [
        new Walker(width / 2, height / 2),
    ],
    'mousewalker': [
        new MouseWalker(width / 2, height / 2),
    ],
    'mover': movers
};
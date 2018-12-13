
import CreatureInterface from "../elements/CreatureInterface";
import Walker from '../elements/Walker';
import MouseWalker from '../elements/MouseWalker';

export const width: number = 640;
export const height: number = 360;

export const pages: string[] = ['walker', 'mousewalker'];

export const pageLabelMapping: { [key: string]: string } = {
    'walker': 'Walker',
    'mousewalker': 'Mouse Walker'
};

export const pageCreatureMapping: { [key: string]: CreatureInterface[] } = {
    'walker': [
        new Walker(width / 2, height / 2),
    ],
    'mousewalker': [
        new MouseWalker(width / 2, height / 2),
    ]
};
import * as numjs from 'numjs';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import KochLine from '../elements/KochLine';
import { magnitude, normalize, rotate } from '../utils/math';

type Vector = nj.NdArray;

const initialTime: number = 0;
const initialGrid: number[] = [];
const initialRule: number[] = [0, 1, 0, 1, 1, 0, 1, 0];
let time: number = initialTime;
let grid: number[] = initialGrid;
let rule: number[] = initialRule;

const generateNextGrid = (g: number[]):number[] => {
    const result: number[] = [g[0]];
    for (let i = 1; i < g.length - 1; i++) {
        const key = `${g[i - 1]}${g[i]}${g[i+1]}`;
        const next = rule[parseInt(key, 2)];
        result.push(next);
    }
    result.push(g[g.length - 1]);
    return result;
};

const generateNextRule = (ruleNumber:number):number[] => {
    const newRule = ruleNumber.toString(2).split('').map(c => parseInt(c, 10));
    const zeroes = [];
    if (newRule.length < rule.length) {
        for (let i = 0; i < (rule.length - newRule.length); i++) {
            zeroes.push(0);
        }
    }
    return [...zeroes, ...newRule];
};

const drawGrid = (g: number[], ctx: CanvasRenderingContext2D, t: number): void => {
    for (let i = 0; i < g.length; i++) {
        if (g[i] === 1) {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.fillRect(i, t, 1, 1);
            ctx.stroke();
        }
    }
};

const cellFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const {worldWidth, worldHeight, currentFrame} = canvasState;
    if (currentFrame === 0) {
        time = initialTime;
        grid = initialGrid;
        rule = initialRule;
    }
    if (time === 0) {
        for (let i = 0; i < worldWidth; i++) {
            grid.push(0);
        }
        grid[Math.floor(worldWidth / 2)] = 1;
    } else {
        const newGrid = generateNextGrid(grid);
        grid = newGrid;
    }
    if (time <= worldHeight && canvasState.ctx) {
        drawGrid(grid, canvasState.ctx, time);
    }
    if (time === worldHeight) {
        time = 0;
        if (canvasState.ctx) {
            canvasState.ctx.clearRect(0 ,0, worldWidth, worldHeight);
            const nextRuleNumber = Math.floor(Math.random() * 256);
            rule = generateNextRule(nextRuleNumber);
        }
    } else {
        time++;
    }
};

let lines: KochLine[] = [];
let counter: number = 0;

const generateNextLines = ():KochLine[] => {
    const next: KochLine[] = [];
    lines.forEach(line => {
        const diff: Vector = line.end.subtract(line.start);
        const newVector = diff.divide(3);
        const a: Vector = line.start;
        const e: Vector = line.end;
        const b: Vector = newVector.add(line.start);
        const d: Vector = line.end.subtract(newVector);
        const c: Vector = b.add(rotate(diff.divide(3), -60 * Math.PI / 180));
        next.push(new KochLine(a, b));
        next.push(new KochLine(b, c));
        next.push(new KochLine(c, d));
        next.push(new KochLine(d, e));
    });
    return next;
};

const fractalFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const { worldWidth, worldHeight, currentFrame, pressedKey, ctx } = canvasState;
    if (currentFrame === 0) {
        counter = 0;
        lines = [
            new KochLine(
                numjs.array([worldWidth / 2 - 100, worldHeight / 2 - 100]),
                numjs.array([worldWidth / 2 + 100, worldHeight / 2 - 100]),
            ),
            new KochLine(
                numjs.array([worldWidth / 2 + 100, worldHeight / 2 - 100]),
                numjs.array([worldWidth / 2 + 100, worldHeight / 2 + 100]),
            ),
            new KochLine(
                numjs.array([worldWidth / 2 + 100, worldHeight / 2 + 100]),
                numjs.array([worldWidth / 2 - 100, worldHeight / 2 + 100]),
            ),
            new KochLine(
                numjs.array([worldWidth / 2 - 100, worldHeight / 2 + 100]),
                numjs.array([worldWidth / 2 - 100, worldHeight / 2 - 100]),
            )
        ];
        lines.forEach((line: KochLine) => {
            line.display(canvasState);
        });
    } else {
        if (pressedKey === 'z' && counter < 6 && ctx) {
            ctx.clearRect(0, 0, worldWidth, worldHeight);
            lines = generateNextLines();
            lines.forEach((line: KochLine) => {
                line.display(canvasState);
            });
            counter++;
        }
    }
};

export const cellExperiment = {
    'label': 'Cell',
    'creatures': [],
    'environments': [],
    'forceFunction': cellFunction,
    'initialForceFunction': () => { }
};

export const fractalExperiment = {
    'label': 'Fractal',
    'creatures': [],
    'environments': [],
    'forceFunction': fractalFunction,
    'initialForceFunction': () => { }
};
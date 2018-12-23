import { width, height } from '../constants/world';
import * as numjs from 'numjs';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment, IPopulation } from "../elements/ElementInterface";
import Attractor from '../elements/Attractor';
import SearcherPopulation from '../elements/SearcherPopulation';
import Obstacle from '../elements/Obstacle';
import Bloop, { BloopDNA, BloopFood } from '../elements/Bloop';
import { mapping, magnitude } from '../utils/math';

type Vector = nj.NdArray;

let population: SearcherPopulation;
const populationNum: number = 50;
const lifetime: number = 180;
const maxForce: number = 0.35;
const mutationRate: number = 0.005;
const obstacleWidth = 350;
const obstacleheight = 15;
const targetLocation: Vector = numjs.array([
    width / 2, 100
]);
let currentLifeTime: number = 0;

const searcherExperiment = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const { currentFrame } = canvasState;
    if (currentFrame === 0) {
        currentLifeTime = 0;
        population = new SearcherPopulation(populationNum, mutationRate, lifetime, maxForce);
    }
    if (currentLifeTime < lifetime) {
        currentEnvironment.forEach(environment => environment.display(canvasState));
        population.run(canvasState, currentLifeTime, currentEnvironment);
        currentLifeTime++;
    } else {
        currentLifeTime = 0;
        population.fitness(targetLocation);
        population.selection();
        population.reproduction();
    }
};

const reproductionRate = 0.001;
const foodMax = 6;
const foodReproductionRate = 0.1;
let bloops: Bloop[] = [];
let bloopFoods: BloopFood[] = [];
const num = 15;
function createBloops(): Bloop[] {
    const maxForce = 1;
    const result: Bloop[] = []
    for (let i = 0; i < num; i++) {
        result.push(
            new Bloop(
                numjs.array([
                    mapping(Math.random(), 0, 1, 100, width - 100),
                    mapping(Math.random(), 0, 1, 100, height - 100),
                ]),
                new BloopDNA(Math.random() * 20 + 15),
                maxForce
            )
        );
    }
    return result;
}

function createBloopFoods(): BloopFood[] {
    const result: BloopFood[] = []
    for (let i = 0; i < foodMax; i++) {
        const x = mapping(Math.random(), 0, 1, 100, width - 100);
        const y = mapping(Math.random(), 0, 1, 100, height - 100);
        result.push(
            new BloopFood(
                numjs.array([
                    x,
                    y,
                ]),
                Math.floor(Math.random() * 5 + 10)
            )
        );
    }
    return result;
}

const runBloopExperiment = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const { currentFrame } = canvasState;
    if (currentFrame === 0) {
        bloops = createBloops();
        bloopFoods = createBloopFoods();
    }

    if (bloopFoods.length < foodMax) {
        for (let i = 0; i < (foodMax - bloopFoods.length); i++) {
            if (Math.random() < foodReproductionRate) {
                const x = mapping(Math.random(), 0, 1, 100, width - 100);
                const y = mapping(Math.random(), 0, 1, 100, height - 100);
                bloopFoods.push(
                    new BloopFood(
                        numjs.array([
                            x,
                            y,
                        ]),
                        Math.floor(Math.random() * 5 + 10)
                    )
                );
            }
        }
    }

    bloopFoods.forEach(food => {
        food.display(canvasState);
    });

    bloops = bloops.filter(creature => !(<Bloop>creature).isDead());
    bloops.forEach((creature) => {
        const bloop: Bloop = (<Bloop>creature);
        if (Math.random() < reproductionRate) {
            const newDna: BloopDNA = bloop.dna.crossover(bloop.dna);
            newDna.mutate(mutationRate);
            const newBloop = new Bloop(
                bloop.location,
                newDna,
                bloop.maxForce
            )
            bloops.push(newBloop);
        }
        bloop.run(canvasState);
        for (let j=0; j < bloopFoods.length; j++) {
            const food = bloopFoods[j];
            if (magnitude(food.location.subtract(bloop.location)) <= bloop.mass + food.width / 2) {
                bloop.eat(food);
                bloopFoods.splice(j, 1);
            }
        }
    });
};

export const geneticExperiment = {
    'label': 'Genetic',
    'creatures': [],
    'environments': [
        new Attractor(20, targetLocation),
        new Obstacle(
            numjs.array([width / 2 - obstacleWidth + obstacleWidth / 2, height / 2 - obstacleheight + 100]),
            obstacleWidth,
            obstacleheight
        )
    ],
    'forceFunction': searcherExperiment,
    'initialForceFunction': () => { }
};

export const bloopExperiment = {
    'label': 'Bloop',
    'creatures': [],
    'environments': [],
    'forceFunction': runBloopExperiment,
    'initialForceFunction': () => { }
};
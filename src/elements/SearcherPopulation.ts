import { width, height } from '../constants/world';
import * as numjs from 'numjs';
import { IPopulation, IEnvironment } from "./ElementInterface";
import { mapping, featureScaling } from '../utils/math';
import VectorDNA from './VectorDNA';
import Searcher from './Searcher';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import Obstacle from './Obstacle';

type Vector = nj.NdArray;

export default class SearcherPopulation implements IPopulation<Vector> {
    population: Searcher[] = [];
    private scores: number[] = [];
    private pairs: Searcher[][] = [];

    constructor(public populationNum: number, public mutationRate: number, public lifetime: number, public maxForce: number) {
        for (let i = 0; i < populationNum; i++) {
            const newDna: VectorDNA = new VectorDNA(lifetime, maxForce);
            const living: Searcher = new Searcher(
                numjs.array([width / 2, height]),
                newDna,
            );
            this.population.push(living);
        }
    }

    run(state: ICanvasState, currentTime: number, environments: IEnvironment[]): void {
        this.population.forEach((searcher: Searcher) => {
            if (!searcher.stopped) {
                const force = searcher.dna.genes[currentTime];
                searcher.applyForce(force);
                searcher.run(state);
                environments.forEach(environment => {
                    if (environment instanceof Obstacle) {
                        searcher.stopped = environment.contains(searcher);
                    }
                });
            }
        });
    }

    fitness(target: Vector): void {
        this.scores = [];
        this.population.forEach((searcher: Searcher) => {
            this.scores.push(searcher.fitness(target));
        });
        this.scores = featureScaling(this.scores);
    }

    selection(): void {
        this.pairs = [];
        const lottery:Searcher[] = [];

        this.scores.forEach((score: number, i:number) => {
            const fitScore = Math.floor(score * 100);
            for (let j = 0; j < fitScore; j++) {
                lottery.push(this.population[i]);
            }
        });

        for (let i = 0; i < this.population.length; i++) {
            const firstIndex = Math.floor(mapping(Math.random(), 0, 1, 0, lottery.length));
            let secondIndex = Math.floor(mapping(Math.random(), 0, 1, 0, lottery.length));
            const parentA = lottery[firstIndex];
            let parentB = lottery[secondIndex];
            while (parentA.dna.isIdenticalTo(parentB.dna)) {
                secondIndex = Math.floor(mapping(Math.random(), 0, 1, 0, lottery.length));
                parentB = lottery[secondIndex];
            }
            this.pairs.push([parentA, parentB]);
        }
    }

    reproduction(): void {
        this.population = [];
        this.pairs.forEach((pair: Searcher[]) => {
            const [parentA, parentB] = pair;
            const childDna: VectorDNA = parentA.dna.crossover(parentB.dna);
            childDna.mutate(this.mutationRate);
            this.population.push(new Searcher(
                numjs.array([width / 2, height]),
                childDna,
            ));
        });
    }
}
import * as numjs from 'numjs';
import { IDNA } from "./ElementInterface";
import { mapping, magnitude } from '../utils/math';

type Vector = nj.NdArray;

export default class VectorDNA implements IDNA<Vector> {
    genes: Vector[] = [];

    constructor(public lifetime: number, public maxForce: number) {
        for (let i = 0; i < lifetime; i++) {
            const randomAngle = mapping(Math.random(), 0, 1, 0, Math.PI * 2);
            const newVector: Vector = numjs.array([
                Math.cos(randomAngle),
                Math.sin(randomAngle)
            ]);
            this.genes.push(newVector.multiply(maxForce));
        }
    }

    crossover(partner: VectorDNA): VectorDNA {
        const newDna = new VectorDNA(this.lifetime, this.maxForce);
        for (let i = 0; i < newDna.genes.length; i++) {
            newDna.genes[i] = Math.random() > 0.5 ? this.genes[i] : partner.genes[i];
        }
        return newDna;
    }

    mutate(mutationRate: number): void {
        if (mutationRate < 0 || mutationRate > 1) {
            throw new Error('Mutation rate must between 0 and 1');
        }
        for (let i = 0; i < this.genes.length; i++) {
            if (Math.random() < mutationRate) {
                const randomAngle = mapping(Math.random(), 0, 1, 0, Math.PI * 2);
                const newVector: Vector = numjs.array([
                    Math.cos(randomAngle),
                    Math.sin(randomAngle)
                ]);
                this.genes[i] = newVector.multiply(this.maxForce);
            }
        }
    }

    isIdenticalTo(partner: VectorDNA): boolean {
        let result: number = 0;
        this.genes.forEach((gene: Vector, i: number) => {
            const distance = magnitude(gene.subtract(partner.genes[i]));
            result += distance;
            if (result > 0) {
                return;
            }
        });
        return result === 0;
    }
}
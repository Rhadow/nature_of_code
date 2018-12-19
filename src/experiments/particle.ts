import * as numjs from 'numjs';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import { width, height } from '../constants/world';
import ParticleSystem from '../elements/ParticleSystem';
import Repeller from '../elements/Repeller';

const particleForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    const gravity: nj.NdArray = numjs.array([0, 0.1]);
    let particleSystem: ParticleSystem = <ParticleSystem>creatures[0];
    let repeller: Repeller = <Repeller>currentEnvironment[0];
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    particleSystem.addParticle();
    particleSystem.applyForceToParticles(gravity);
    particleSystem.applyRepeller(repeller);
    particleSystem.run(canvasState);
};

export const particleExperiment = {
    'label': 'Particle',
    'creatures': [new ParticleSystem(numjs.array([width / 2, 80]))],
    'environments': [new Repeller(20, numjs.array([width / 2 - 50, height / 3]))],
    'forceFunction': particleForceFunction,
    'initialForceFunction': () => { }
};
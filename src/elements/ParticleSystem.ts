import * as numjs from 'numjs';
import { IParticleSystem } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, normalize, getCoordinateAfterRotation } from '../utils/math';
import { isNumber } from 'util';
import Particle from './Particle';
import Repeller from './Repeller';

export default class ParticleSystem implements IParticleSystem {
    velocity: nj.NdArray;
    location: nj.NdArray;
    particles: Particle[] = [];
    maxParticles: number = 100;
    protected acceleration: nj.NdArray;
    private pulseForce: number = 10;
    private particleLifespan: number = 255;
    private particleMainColor: string = '#1ca3ec';
    private particleSubColor: string = '#2389da';
    private particleMass: number = 5;

    constructor(location: nj.NdArray, maxParticles?: number) {
        this.location = location;
        this.velocity = numjs.array([0, 0]);
        this.acceleration = numjs.array([0, 0]);
        this.maxParticles = (isNumber(maxParticles) && !isNaN(maxParticles)) ? maxParticles : this.maxParticles;
    }

    applyForce(force: nj.NdArray) {
        const accelerationCausedByForce = force;
        this.acceleration = this.acceleration.add(accelerationCausedByForce);
    }

    applyForceToParticles(force: nj.NdArray) {
        this.particles.forEach(particle => {
            particle.applyForce(force.multiply(particle.mass));
        });
    }

    applyRepeller(repeller: Repeller) {
        this.particles.forEach(particle => {
            const repelForce: nj.NdArray = repeller.repel(particle);
            particle.applyForce(repelForce.multiply(particle.mass));
        });
    }

    addParticle() {
        if (this.particles.length < this.maxParticles) {
            const newParticle = new Particle(this.particleMass, this.location, this.particleLifespan, this.particleMainColor, this.particleSubColor);
            const randomPulse = numjs.array([Math.random() * this.pulseForce * (Math.random() > 0.5 ? 1 : -1), Math.random() * -this.pulseForce]);
            newParticle.applyForce(randomPulse);
            this.particles.push(newParticle);
        }
    }

    run(state: ICanvasState): void {
        this.step(state);
        this.display(state);
    }

    step(state: ICanvasState): void {
        this.velocity = this.velocity.add(this.acceleration);
        this.location = this.location.add(this.velocity);
        this.acceleration = this.acceleration.multiply(0);
    }

    display(state: ICanvasState): void {
        if (state.ctx) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle: Particle = this.particles[i];
                if (particle.isAlive()) {
                    particle.run(state);
                } else {
                    this.particles.splice(i, 1);
                }
            }
        }
    }
}
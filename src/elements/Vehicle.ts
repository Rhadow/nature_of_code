import * as numjs from 'numjs';
import { IVehicle } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, normalize, getCoordinateAfterRotation, limit, mapping } from '../utils/math';
import FlowField from './FlowField';

export default class Vehicle implements IVehicle {
    mass: number;
    size: number;
    location: nj.NdArray;
    velocity: nj.NdArray = numjs.array([0, 0]);
    maxVelocity: number;
    maxSteeringForce: number;
    showWanderingPath: boolean = false;
    private angle: number = -Math.PI / 4;
    private targetDistanceThreshold: number = 0;
    private predictDistance: number = 0;
    private predictRadius: number = 0;
    private nextWanderLocation: nj.NdArray = numjs.array([0, 0]);
    private futurePosition: nj.NdArray = numjs.array([0, 0]);
    private isWandering: boolean = false;
    protected acceleration: nj.NdArray = numjs.array([0, 0]);
    protected mainColor: string = '#ffcf00';
    protected subColor: string = '#0f0b19';

    constructor(mass: number, location: nj.NdArray, maxVelocity: number, maxSteeringForce: number, mainColor?: string, subColor?: string, showWanderingPath?: boolean) {
        this.mass = mass;
        this.size = mass;
        this.predictDistance = mass * 6;
        this.predictRadius = mass * 2;
        this.targetDistanceThreshold = mass * 5;
        this.maxVelocity = maxVelocity;
        this.maxSteeringForce = maxSteeringForce;
        this.location = location;
        this.mainColor = mainColor ? mainColor : this.mainColor;
        this.subColor = subColor ? subColor : this.subColor;
        this.showWanderingPath = showWanderingPath || this.showWanderingPath;
    }

    applyForce(force: nj.NdArray) {
        this.acceleration = this.acceleration.add(force);
    }

    run(state: ICanvasState): void {
        this.step(state);
        this.display(state);
        this.isWandering = false;
    }

    step(state: ICanvasState): void {
        this.velocity = limit(this.velocity.add(this.acceleration), this.maxVelocity);
        this.location = this.location.add(this.velocity);
        if (magnitude(this.velocity) > 0) {
            this.angle = Math.atan2(this.velocity.get(1), this.velocity.get(0));
        }
        this.checkEdges(state.worldWidth, state.worldHeight);
        this.acceleration = this.acceleration.multiply(0);
    }

    display(state: ICanvasState): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        const [newX, newY] = getCoordinateAfterRotation(x, y, this.angle);
        if (state.ctx) {
            state.ctx.beginPath();
            state.ctx.rotate(this.angle);
            state.ctx.moveTo(newX + this.size / 2, newY);
            state.ctx.lineTo(newX - this.size / 2, newY - this.size / 2);
            state.ctx.lineTo(newX - this.size / 4, newY);
            state.ctx.lineTo(newX - this.size / 2, newY + this.size / 2);
            state.ctx.lineTo(newX + this.size / 2, newY);
            state.ctx.fillStyle = this.mainColor;
            state.ctx.lineWidth = 2;
            state.ctx.strokeStyle = this.subColor;
            state.ctx.fill();
            state.ctx.stroke();
            state.ctx.lineWidth = 1;
            state.ctx.strokeStyle = '#000000';
            state.ctx.fillStyle = '#ffffff';
            if (this.isWandering && this.showWanderingPath) {
                const [futureX, futureY] = getCoordinateAfterRotation(this.futurePosition.get(0), this.futurePosition.get(1), this.angle);
                const [wanderX, wanderY] = getCoordinateAfterRotation(this.nextWanderLocation.get(0), this.nextWanderLocation.get(1), this.angle);
                state.ctx.beginPath();
                state.ctx.moveTo(newX + this.size / 2, newY);
                state.ctx.lineTo(futureX, futureY);
                state.ctx.stroke();
                state.ctx.beginPath();
                state.ctx.arc(futureX, futureY, this.predictRadius, 0, Math.PI * 2);
                state.ctx.stroke();
                state.ctx.beginPath();
                state.ctx.moveTo(futureX, futureY);
                state.ctx.lineTo(wanderX, wanderY);
                state.ctx.stroke();
            }
            state.ctx.resetTransform();
        }
    }

    seek(target: nj.NdArray) {
        const desiredVector = target.subtract(this.location);
        const distance = magnitude(desiredVector);
        let desiredVelocity = normalize(desiredVector).multiply(this.maxVelocity);
        if (distance < this.targetDistanceThreshold) {
            const velocity = mapping(distance, 0, this.targetDistanceThreshold, 0, this.maxVelocity);
            desiredVelocity = normalize(desiredVector).multiply(velocity)
        }
        const steer = desiredVelocity.subtract(this.velocity);
        const steeringForce = limit(steer, this.maxSteeringForce);
        this.applyForce(steeringForce);
    }

    wander() {
        const futureX = this.location.get(0) + this.predictDistance * Math.cos(this.angle);
        const futureY = this.location.get(1) + this.predictDistance * Math.sin(this.angle);
        this.futurePosition = numjs.array([futureX, futureY]);
        const newSubAngle = mapping(Math.random(), 0, 1, 0, 2 * Math.PI);
        const xOffset = this.predictRadius * Math.cos(newSubAngle);
        const yOffset = this.predictRadius * Math.sin(newSubAngle);
        this.nextWanderLocation = numjs.array([futureX + xOffset, futureY + yOffset]);
        this.seek(this.nextWanderLocation);
        this.isWandering = true;
    }

    follow(flowField: FlowField) {
        const force = flowField.getField(this.location);
        const desiredVelocity = normalize(force).multiply(this.maxVelocity);
        const steer = desiredVelocity.subtract(this.velocity);
        const steeringForce = limit(steer, this.maxSteeringForce);
        this.applyForce(steeringForce);
    }

    checkEdges(worldWidth: number, worldHeight: number): void {
        const x = this.location.get(0);
        const y = this.location.get(1);
        let newX: number = x;
        let newY: number = y;
        if (x > worldWidth) {
            newX = 0;
        }
        if (x < 0) {
            newX = worldWidth;
        }
        if (y > worldHeight) {
            newY = 0;
        }
        if (y < 0) {
            newY = worldHeight;
        }
        this.location = numjs.array([newX, newY]);
    }
}
import * as numjs from 'numjs';
import { IVehicle } from './ElementInterface';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { magnitude, normalize, getCoordinateAfterRotation, limit, mapping, findNormalPoint } from '../utils/math';
import FlowField from './FlowField';
import Path from './Path';

export default class Vehicle implements IVehicle {
    mass: number;
    size: number;
    location: nj.NdArray;
    velocity: nj.NdArray = numjs.array([0, 0]);
    maxVelocity: number;
    maxSteeringForce: number;
    isDebugging: boolean = false;
    private angle: number = mapping(Math.random(), 0, 1, 0, Math.PI * 2);
    private targetDistanceThreshold: number = 0;
    private predictDistance: number = 0;
    private predictRadius: number = 0;
    private nextWanderLocation: nj.NdArray = numjs.array([0, 0]);
    private futurePosition: nj.NdArray = numjs.array([0, 0]);
    private normalPointOnPath: nj.NdArray = numjs.array([0, 0]);
    private isWandering: boolean = false;
    private isFollowingPath: boolean = false;
    protected acceleration: nj.NdArray = numjs.array([0, 0]);
    protected mainColor: string = '#ffcf00';
    protected subColor: string = '#0f0b19';

    constructor(mass: number, location: nj.NdArray, maxVelocity: number, maxSteeringForce: number, mainColor?: string, subColor?: string, isDebugging?: boolean) {
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
        this.isDebugging = isDebugging || this.isDebugging;
    }

    applyForce(force: nj.NdArray) {
        this.acceleration = this.acceleration.add(force);
    }

    run(state: ICanvasState): void {
        this.step(state);
        this.display(state);
        this.isWandering = false;
        this.isFollowingPath = false;
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
            if (this.isDebugging) {
                if (this.isWandering) {
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
                if (this.isFollowingPath) {
                    const [futureX, futureY] = getCoordinateAfterRotation(this.futurePosition.get(0), this.futurePosition.get(1), this.angle);
                    const [normalX, normalY] = getCoordinateAfterRotation(this.normalPointOnPath.get(0), this.normalPointOnPath.get(1), this.angle);
                    state.ctx.beginPath();
                    state.ctx.moveTo(newX + this.size / 2, newY);
                    state.ctx.lineTo(futureX, futureY);
                    state.ctx.stroke();
                    state.ctx.beginPath();
                    state.ctx.moveTo(futureX, futureY);
                    state.ctx.lineTo(normalX, normalY);
                    state.ctx.stroke();
                }
            }
            state.ctx.resetTransform();
        }
    }

    seek(target: nj.NdArray): nj.NdArray {
        const desiredVector = target.subtract(this.location);
        const distance = magnitude(desiredVector);
        let desiredVelocity = normalize(desiredVector).multiply(this.maxVelocity);
        if (distance < this.targetDistanceThreshold) {
            const velocity = mapping(distance, 0, this.targetDistanceThreshold, 0, this.maxVelocity);
            desiredVelocity = normalize(desiredVector).multiply(velocity)
        }
        const steer = desiredVelocity.subtract(this.velocity);
        const steeringForce = limit(steer, this.maxSteeringForce);
        return steeringForce;
    }

    wander(): void {
        const futureX = this.location.get(0) + this.predictDistance * Math.cos(this.angle);
        const futureY = this.location.get(1) + this.predictDistance * Math.sin(this.angle);
        this.futurePosition = numjs.array([futureX, futureY]);
        const newSubAngle = mapping(Math.random(), 0, 1, 0, 2 * Math.PI);
        const xOffset = this.predictRadius * Math.cos(newSubAngle);
        const yOffset = this.predictRadius * Math.sin(newSubAngle);
        this.nextWanderLocation = numjs.array([futureX + xOffset, futureY + yOffset]);
        const seekForce = this.seek(this.nextWanderLocation);
        this.applyForce(seekForce);
        this.isWandering = true;
    }

    follow(flowField: FlowField): void {
        const force = flowField.getField(this.location);
        const desiredVelocity = normalize(force).multiply(this.maxVelocity);
        const steer = desiredVelocity.subtract(this.velocity);
        const steeringForce = limit(steer, this.maxSteeringForce);
        this.applyForce(steeringForce);
    }

    private getClosestNormalFromPath(path: Path): nj.NdArray[] {
        const predictDistance = this.mass * 2;
        const futureX = this.location.get(0) + predictDistance * Math.cos(this.angle);
        const futureY = this.location.get(1) + predictDistance * Math.sin(this.angle);
        const threshold = Math.min(this.size * 2, 10);
        let result: nj.NdArray[] = [numjs.array([Infinity, Infinity])];
        let minResult: nj.NdArray[] = [numjs.array([Infinity, Infinity])];
        let normalFound: boolean = false;
        this.futurePosition = numjs.array([futureX, futureY]);
        for (let i = 0; i < path.points.length - 1; i++) {
            const start = path.points[i];
            const end = path.points[i + 1];
            if (magnitude(this.futurePosition.subtract(end)) < threshold) {
                continue;
            }
            let normalPoint = findNormalPoint(start, end, this.futurePosition);
            const isNormalInPath = normalPoint.get(0) >= Math.min(start.get(0), end.get(0)) && normalPoint.get(0) <= Math.max(start.get(0), end.get(0));
            const currentDistance = magnitude(normalPoint.subtract(this.futurePosition));
            const minResultDistance = magnitude(minResult[0].subtract(this.futurePosition));
            if (currentDistance <= minResultDistance) {
                minResult = [normalPoint, start, end];
            }
            if (isNormalInPath) {
                normalFound = true;
                const resultDistance = magnitude(result[0].subtract(this.futurePosition));
                if (currentDistance <= resultDistance) {
                    result = [normalPoint, start, end];
                }
            }
        }
        if (!normalFound) {
            result = minResult;
        }
        return result;
    }

    getClosestNormalFromPathV1(path: Path): nj.NdArray[] {
        const predictDistance = this.mass * 2;
        const futureX = this.location.get(0) + predictDistance * Math.cos(this.angle);
        const futureY = this.location.get(1) + predictDistance * Math.sin(this.angle);
        let result: nj.NdArray[] = [numjs.array([Infinity, Infinity])];
        this.futurePosition = numjs.array([futureX, futureY]);
        for (let i = 0; i < path.points.length - 1; i++) {
            const start = path.points[i];
            const end = path.points[i + 1];
            let normalPoint = findNormalPoint(start, end, this.futurePosition);
            const isNormalInPath = normalPoint.get(0) >= Math.min(start.get(0), end.get(0)) && normalPoint.get(0) <= Math.max(start.get(0), end.get(0));
            if (!isNormalInPath) {
                normalPoint = end;
            }
            const resultDistance = magnitude(result[0].subtract(this.futurePosition));
            const currentDistance = magnitude(normalPoint.subtract(this.futurePosition));
            if (currentDistance <= resultDistance) {
                result = [normalPoint, start, end];
            }
        }
        return result;
    }

    followPath(path: Path): void {
        this.isFollowingPath = true;
        const [normalPoint, start, end] = this.getClosestNormalFromPathV1(path);
        // const [normalPoint, start, end] = this.getClosestNormalFromPath(path);
        this.normalPointOnPath = normalPoint;
        const targetDistanceFromNormal = 25;
        const distance = magnitude(this.normalPointOnPath.subtract(this.location));
        const target = normalize(end.subtract(start)).multiply(targetDistanceFromNormal).add(normalPoint);
        if (distance > path.radius || magnitude(this.velocity) === 0) {
            const seekForce = this.seek(target);
            this.applyForce(seekForce);
        }
    }

    seperate(others: Vehicle[]): nj.NdArray {
        let count: number = 0;
        let sum: nj.NdArray = numjs.array([0, 0]);
        let result: nj.NdArray = numjs.array([0, 0]);
        const separation = 50;

        for (let i = 0; i < others.length; i++) {
            const otherNode = others[i];
            const force = this.location.subtract(otherNode.location);
            const distance = magnitude(force);

            if (distance > 0 && distance < separation) {
                sum = sum.add(normalize(force));
                count++;
            }
        }
        if (count > 0) {
            sum = sum.divide(count);
            const desiredVelocity = sum.multiply(this.maxVelocity);
            const steer = desiredVelocity.subtract(this.velocity);
            result = limit(steer, this.maxSteeringForce);
        }
        return result;
    }

    applyBehaviors(others: Vehicle[], target: nj.NdArray, seekMag: number, seperateMag: number): void {
        const seekForce = this.seek(target);
        const seperateForce = this.seperate(others);
        this.applyForce(seekForce.multiply(seekMag));
        this.applyForce(seperateForce.multiply(seperateMag));
    }

    align(others: Vehicle[]): nj.NdArray {
        let count: number = 0;
        let sum: nj.NdArray = numjs.array([0, 0]);
        let result: nj.NdArray = numjs.array([0, 0]);
        const radius = 50;

        for (let i = 0; i < others.length; i++) {
            const otherNode = others[i];
            const force = this.location.subtract(otherNode.location);
            const distance = magnitude(force);

            if (distance > 0 && distance < radius) {
                sum = sum.add(others[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum = normalize(sum.divide(count));
            const desiredVelocity = sum.multiply(this.maxVelocity);
            const steer = desiredVelocity.subtract(this.velocity);
            result = limit(steer, this.maxSteeringForce);
        }
        return result;
    }

    cohesion(others: Vehicle[]): nj.NdArray {
        let count: number = 0;
        let sum: nj.NdArray = numjs.array([0, 0]);
        let result: nj.NdArray = numjs.array([0, 0]);
        const radius = 50;

        for (let i = 0; i < others.length; i++) {
            const otherNode = others[i];
            const force = this.location.subtract(otherNode.location);
            const distance = magnitude(force);

            if (distance > 0 && distance < radius) {
                sum = sum.add(otherNode.location);
                count++;
            }
        }
        if (count > 0) {
            sum = sum.divide(count);
            result = this.seek(sum);
        }
        return result;
    }

    flock(others: Vehicle[], seperateMag: number, alignMag: number, cohesionMag: number): void {
        const seperateForce = this.seperate(others);
        const alignForce = this.align(others);
        const cohesionForce = this.cohesion(others);
        this.applyForce(seperateForce.multiply(seperateMag));
        this.applyForce(alignForce.multiply(alignMag));
        this.applyForce(cohesionForce.multiply(cohesionMag));
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
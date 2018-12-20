import * as numjs from 'numjs';
import { ICanvasState } from '../components/Canvas/CanvasInterfaces';
import { ICreature, IEnvironment } from "../elements/ElementInterface";
import { width, height } from '../constants/world';
import Vehicle from '../elements/Vehicle';
import Path from '../elements/Path';
import FlowField from '../elements/FlowField';
import { perlin2, seed } from '../utils/noise';
import { mapping } from '../utils/math';

const vehicleForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    const seeker: Vehicle = <Vehicle>creatures[0];
    const wanderer: Vehicle = <Vehicle>creatures[1];
    const seekForce = seeker.seek(numjs.array([canvasState.mouseX, canvasState.mouseY]));
    seeker.applyForce(seekForce);
    wanderer.wander();
    (<Vehicle[]>creatures).forEach((vehicle: Vehicle) => {
        vehicle.run(canvasState);
    });
}

const generateMagneticFields = (mouseX: number, mouseY: number) => (width: number, height: number, resolution: number): nj.NdArray[][] => {
    const result: nj.NdArray[][] = [];
    const rows = Math.floor(width / resolution);
    const cols = Math.floor(height / resolution);
    for (let i = 0; i < rows; i++) {
        result[i] = [];
        for (let j = 0; j < cols; j++) {
            const center = numjs.array([
                i * Math.floor(resolution / 2) + resolution,
                j * Math.floor(resolution / 2) + resolution
            ]);
            const target = numjs.array([
                mouseX,
                mouseY
            ]);
            const newField = numjs.array([
                target.subtract(center).get(0),
                target.subtract(center).get(1)
            ]);

            result[i].push(newField);
        }
    }
    return result;
}

const flowFieldForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    // Magnetic
    // currentEnvironment[0] = new FlowField(width, height, 25, generateMagneticFields(canvasState.mouseX, canvasState.mouseY), true)
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    const flowField: FlowField = <FlowField>currentEnvironment[0];
    (<Vehicle[]>creatures).forEach((vehicle: Vehicle) => {
        vehicle.follow(flowField);
        vehicle.run(canvasState);
    });
}

const generateFlowFields = (width: number, height: number, resolution: number): nj.NdArray[][] => {
    const result: nj.NdArray[][] = [];
    const rows = Math.floor(width / resolution);
    const cols = Math.floor(height / resolution);
    seed(10);
    let xOffset = 0;
    for (let i = 0; i < rows; i++) {
        result[i] = [];
        let yOffset = 0;
        for (let j = 0; j < cols; j++) {
            const theta = mapping(perlin2(xOffset, yOffset), 0, 1, 0, Math.PI * 2);
            const newField = numjs.array([
                Math.cos(theta),
                Math.sin(theta)
            ])
            result[i].push(newField);
            yOffset += 0.04;
        }
        xOffset += 0.03;
    }
    return result;
}

const pathForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    if (canvasState.pressedKey === 'z') {
        currentEnvironment[0] = new Path(
            [
                numjs.array([0, Math.random() * height / 2 + height / 4]),
                numjs.array([width / 4, Math.random() * height / 2 + height / 4]),
                numjs.array([width / 2, Math.random() * height / 2 + height / 4]),
                numjs.array([width * 3 / 4, Math.random() * height / 2 + height / 4]),
                numjs.array([width, Math.random() * height / 2 + height / 4]),
            ],
            Math.random() * 15 + 10
        )
    }
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    const path: Path = <Path>currentEnvironment[0];
    (<Vehicle[]>creatures).forEach((vehicle: Vehicle) => {
        vehicle.followPath(path);
        vehicle.run(canvasState);
    });
}

const groupForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    currentEnvironment.forEach((environment: IEnvironment) => {
        environment.display(canvasState);
    });
    (<Vehicle[]>creatures).forEach((vehicle: Vehicle) => {
        vehicle.applyBehaviors(
            <Vehicle[]>creatures,
            numjs.array([canvasState.mouseX, canvasState.mouseY]),
            1,
            1.1
        );
        vehicle.run(canvasState);
    });
}

const flockForceFunction = (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => {
    (<Vehicle[]>creatures).forEach((vehicle: Vehicle) => {
        vehicle.flock(
            <Vehicle[]>creatures,
            1.5,
            5,
            2
        );
        vehicle.run(canvasState);
    });
}

const generateVehicles = (n: number):Vehicle[] => {
    const result = [];
    for (let i = 0; i < n; i++) {
        const w = width / 2 - 100 + Math.random() * 100;
        const h = height / 2 - 100 + Math.random() * 100;
        const newVehicle = new Vehicle(
            15,
            numjs.array([w, h]),
            6,
            0.2
        );
        newVehicle.velocity = numjs.array([
            (Math.random() > 0.5 ? 1 : -1) * Math.random(),
            (Math.random() > 0.5 ? 1 : -1) * Math.random()
        ]);
        result.push(newVehicle);
    }

    return result;
};

export const vehicleExperiment = {
    'label': 'Vehicle',
    'creatures': [
        new Vehicle(20, numjs.array([80, height / 2]), 4, 0.1),
        new Vehicle(20, numjs.array([width / 2, height / 2]), 4, 0.2, '#7f80a7', '#4c4b67', true)
    ],
    'environments': [],
    'forceFunction': vehicleForceFunction,
    'initialForceFunction': () => { }
};

export const flowFieldExperiment = {
    'label': 'FlowField',
    'creatures': [
        new Vehicle(20, numjs.array([width / 2, 10]), 6, 0.2, '#f9d71c', '#8b8b8b'),
        new Vehicle(20, numjs.array([10, 10]), 4, 0.4, '#b60505', '#6b0202')
    ],
    'environments': [
        new FlowField(width, height, 25, generateFlowFields, true)
    ],
    'forceFunction': flowFieldForceFunction,
    'initialForceFunction': () => { }
};

export const pathExperiment = {
    'label': 'Path',
    'creatures': [
        new Vehicle(20, numjs.array([15, 15]), 8, 0.1, '#f9d71c', '#8b8b8b', true),
        new Vehicle(20, numjs.array([15, 15]), 4, 0.2, '#b60505', '#6b0202', true)
    ],
    'environments': [
        new Path(
            [
                numjs.array([0, Math.random() * height / 2 + height / 4]),
                numjs.array([width / 4, Math.random() * height / 2 + height / 4]),
                numjs.array([width / 2, Math.random() * height / 2 + height / 4]),
                numjs.array([width * 3 / 4, Math.random() * height / 2 + height / 4]),
                numjs.array([width, Math.random() * height / 2 + height / 4]),
            ],
            Math.random() * 15 + 10
        )
    ],
    'forceFunction': pathForceFunction,
    'initialForceFunction': () => { }
};

export const groupExperiment = {
    'label': 'Group',
    'creatures': generateVehicles(25),
    'environments': [],
    'forceFunction': groupForceFunction,
    'initialForceFunction': () => { }
};

export const flockExperiment = {
    'label': 'Flock',
    'creatures': generateVehicles(25),
    'environments': [],
    'forceFunction': flockForceFunction,
    'initialForceFunction': () => { }
};

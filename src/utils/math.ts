import * as numjs from 'numjs';

type Vector = nj.NdArray;

export const monteCarloRandom = (): number => {
    while (true) {
        const r1: number = Math.random();
        const prob: number = r1;
        const r2: number = Math.random();
        if (r2 > prob) {
            return r1;
        }
    }
}

export const magnitude = (v: Vector): number => {
    return Math.sqrt(v.pow(2).sum());
}

export const normalize = (v: Vector): Vector => {
    return v.divide(magnitude(v));
}

export const limit = (v: Vector, maximum: number): Vector => {
    const vMag = magnitude(v);
    if (vMag <= maximum) {
        return v;
    }
    return normalize(v).multiply(maximum);
}

export const getCoordinateAfterRotation = (x:number, y:number, angle: number): number[] => {
    return [
        Math.cos(angle) * x + Math.sin(angle) * y,
        -Math.sin(angle) * x + Math.cos(angle) * y,
    ];
}

export const mapping = (x: number, xMin: number, xMax: number, yMin: number, yMax: number): number => {
    const ratio = (x - xMin) / (xMax - xMin);
    return (yMax - yMin) * ratio + yMin;
};

export const angleBetween = (v1: Vector, v2: Vector): number => {
    const dotProduct = v1.dot(v2);
    return Math.acos(dotProduct.get(0) / (magnitude(v1) * magnitude(v2)))
}

export const findNormalPoint = (a: Vector, b: Vector, p: Vector):Vector => {
    const ab: Vector = b.subtract(a);
    const ap: Vector = p.subtract(a);
    const theta = angleBetween(ab, ap);
    const distance = normalize(ab).multiply(magnitude(ap) * Math.cos(theta));
    return a.add(distance);
}

export const rotate = (v: Vector, newAngle: number): Vector => {
    const originalAngle = Math.atan2(v.get(1), v.get(0));
    return numjs.array([
        magnitude(v) * Math.cos(originalAngle + newAngle),
        magnitude(v) * Math.sin(originalAngle + newAngle),
    ]);
}
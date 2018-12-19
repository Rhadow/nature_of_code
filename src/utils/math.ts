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

export const magnitude = (v: nj.NdArray): number => {
    return Math.sqrt(v.pow(2).sum());
}

export const normalize = (v: nj.NdArray): nj.NdArray => {
    return v.divide(magnitude(v));
}

export const limit = (v: nj.NdArray, maximum: number): nj.NdArray => {
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
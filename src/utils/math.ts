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
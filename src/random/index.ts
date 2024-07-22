export const randomBetween = (start: number, end: number): number => {
    const delta = end - start;
    return start + delta * random();
};

// ref: https://stackoverflow.com/questions/72334889/why-is-math-random-being-outperformed-by-crypto-getrandomvalues
export const random = (() => {
    const MAX = 2 ** 32 - 1;
    const pool = crypto.getRandomValues(new Uint32Array(1024)); // 4MB
    let index = 0;

    return () => {
        const value = pool[index];
        index++;
        if (index === pool.length) {
            crypto.getRandomValues(pool);
            index = 0;
        }
        return value / MAX;
    };
})();

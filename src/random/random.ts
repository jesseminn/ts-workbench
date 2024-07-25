// ref: https://stackoverflow.com/questions/72334889/why-is-math-random-being-outperformed-by-crypto-getrandomvalues
// benchmark: https://measurethat.net/Benchmarks/Show/31447/0/mathrandom-vs-random
export const random = (() => {
    const MAX = 2 ** 32 - 1;
    const pool = crypto.getRandomValues(new Uint32Array(1024)); // 4MB
    let index = 0;

    return (range?: [number, number]) => {
        const value = pool[index];
        index++;

        if (index === pool.length) {
            crypto.getRandomValues(pool);
            index = 0;
        }

        let result = value / MAX;
        if (range) {
            const delta = range[1] - range[0];
            result = range[0] + delta * result;
        }
        return result;
    };
})();

// ref: https://stackoverflow.com/a/1349426
// benchmark: https://measurethat.net/Benchmarks/Show/31464/0/generate-random-string
export const randomString = (() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const charset = `${lowercase}${uppercase}${digits}`;

    return (length: number) => {
        let result = '';
        for (let i = 0; i < length; i++) {
            const id = randomInt([0, charset.length - 1]);
            result += charset[id];
        }
        return result;
    };
})();

// ref: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
export const randomInt = (range: [number, number]) => {
    const min = Math.ceil(Math.min(...range));
    const max = Math.floor(Math.max(...range));
    return Math.floor(random() * (max - min + 1)) + min;
};

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

export const inBetween = (range: [number, number], value: number) => {
    const min = Math.min(...range);
    const max = Math.max(...range);
    return min <= value && value <= max;
};

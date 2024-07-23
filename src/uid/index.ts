import { randomString } from '../random';

const cache = new WeakMap<object, string>();

export const uid = (seed?: object) => {
    if (seed && cache.has(seed)) {
        return cache.get(seed)!;
    }

    const result = randomString(8);

    if (seed) {
        cache.set(seed, result);
    }

    return result;
};

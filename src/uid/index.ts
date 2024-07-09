const cache = new WeakMap<object, string>();

export const uid = (seed?: object) => {
    if (seed && cache.has(seed)) {
        return cache.get(seed)!;
    }

    // https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
    const result = Math.random().toString(16).slice(2, 10);

    if (seed) {
        cache.set(seed, result);
    }

    return result;
};

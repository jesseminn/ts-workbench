// https://adamcoster.com/blog/pojo-detector
export const isPOJO = (x: unknown): x is object => {
    return x !== null && typeof x === 'object' && [null, Object.prototype].includes(Object.getPrototypeOf(x));
};

export const isPrimitive = (x: unknown): x is string | number | bigint | boolean | symbol | undefined | null => {
    switch (typeof x) {
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'symbol':
        case 'undefined':
            return true;
        case 'object':
            return x === null;
        case 'function':
            return false;
    }
};

export const isReference = (x: unknown): x is object => {
    return !isPrimitive(x);
};

export const isIterable = () => {};

export const isWithToJSON = () => {};

// An util object
export const ID = {
    match(v: string) {
        const regex = /^##(.*?)##/;
        return regex.exec(v);
    },
    bind(id: string | number, v: string) {
        // TODO: randomize wrappers in production
        const start = '##';
        const end = '##';
        return `${start}${id}${end}${v}`;
    },
    strip(v: string) {
        const result = this.match(v);
        if (!result) {
            return v;
        } else {
            const matched = result[0];
            return v.slice(matched.length);
        }
    },
    parse(v: string) {
        const result = this.match(v);
        if (!result) {
            return '';
        } else {
            const matched = result[1];
            return matched;
        }
    },
};

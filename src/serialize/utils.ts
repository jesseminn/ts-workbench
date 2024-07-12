// https://adamcoster.com/blog/pojo-detector
export const isPOJO = (x: unknown): x is POJO => {
    return x !== null && typeof x === 'object' && [null, Object.prototype].includes(Object.getPrototypeOf(x));
};

export type POJO<T = unknown> = Record<ObjectKey, T>;

export type ObjectKey = string | symbol;

// An util object
export const ID = {
    match(v: string) {
        const regex = /^##(.*?)##/;
        return regex.exec(v);
    },
    bind(id: number, v: string) {
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

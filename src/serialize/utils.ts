import { uid } from '../uid';

// https://adamcoster.com/blog/pojo-detector
export const isPOJO = (x: unknown): x is POJO => {
    return x !== null && typeof x === 'object' && [null, Object.prototype].includes(Object.getPrototypeOf(x));
};

export type POJO<T = unknown> = Record<ObjectKey, T>;

export type ObjectKey = string | symbol;

// TODO: replace this with bundler
const __DEV__ = true;

export abstract class ID {
    private static readonly start = __DEV__ ? '##__' : uid();
    private static readonly end = __DEV__ ? '__##' : uid();
    private static match(v: string) {
        const regex = new RegExp(`^${this.start}(.*?)${this.end}`);
        return regex.exec(v);
    }
    static bind(id: number, v: string) {
        return `${this.start}${id}${this.end}${v}`;
    }
    static strip(v: string) {
        const result = this.match(v);
        if (!result) {
            return v;
        } else {
            const matched = result[0];
            return v.slice(matched.length);
        }
    }
    static parse(v: string) {
        const result = this.match(v);
        if (!result) {
            return '';
        } else {
            const matched = result[1];
            return matched;
        }
    }
}

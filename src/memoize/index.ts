import { Cached } from '../cached';
import { serialize } from '../serialize';

export type MemoizeOptions<I extends any[]> = {
    keyExtractor?: (...args: I) => string;
    ttl?: number;
    debug?: {
        enabled: boolean;
        label: string;
    };
};

export type MemoizedFn<I extends any[], O> = {
    (...args: I): O;
    delete: (...args: I) => boolean;
    clear: () => void;
};

export const memoize = <I extends any[], O>(fn: (...args: I) => O, options?: MemoizeOptions<I>): MemoizedFn<I, O> => {
    const cache = new Cached<O>();

    const log = (key: string, message: string) =>
        options?.debug?.enabled ? console.log(`[${options.debug.label}(${key})] ${message}`) : undefined;

    const keyExtractor = (...args: I) =>
        typeof options?.keyExtractor === 'function' ? options.keyExtractor(...args) : serialize(args);

    const memoizedFn: MemoizedFn<I, O> = (...args: I) => {
        const key = keyExtractor(...args);
        let result: O;
        if (cache.has(key)) {
            log(key, `flush cache`);
            result = cache.get(key) as O;
        } else {
            log(key, 'no cache');
            result = fn(...args);
            cache.set(key, result, options?.ttl);
        }
        return result;
    };

    memoizedFn.delete = (...args: I) => {
        const key = keyExtractor(...args);
        return cache.delete(key);
    };

    memoizedFn.clear = () => {
        return cache.clear();
    };

    return memoizedFn;
};

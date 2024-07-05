import { serialize, deserialize } from '../serialize';
import { PromiseResolve, PromiseReject } from '../types';

export type BatchOptions<I, O> = {
    type?: 'debounce' | 'timeout';
    duration?: number;
    select?: (i: I, o: O) => boolean;
};

export function batch<I, O>(action: (args: I[]) => O[] | Promise<O[]>, options?: BatchOptions<I, O>) {
    // prepare option values
    const type = options?.type ?? 'debounce';
    const duration = options?.duration ?? 20;
    // silence TS2367: comparison appears to be unintentional
    const select = options?.select ?? ((i, o) => i === (o as any));

    // TODO: need to serialize the key to string because I could be anything
    // if I is not primitive, the object with the same content will be considered different
    const map = new Map<string, Array<[PromiseResolve<O>, PromiseReject]>>();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (arg: I): Promise<O> {
        const key = serialize(arg);

        return new Promise<O>((resolve, reject) => {
            if (!map.has(key)) {
                map.set(key, [[resolve, reject]]);
            } else {
                const handlers = map.get(key)!;
                handlers.push([resolve, reject]);
            }

            if (timeoutId !== null) {
                switch (type) {
                    case 'debounce':
                        clearTimeout(timeoutId);
                        break;
                    case 'timeout':
                        return;
                }
            }

            timeoutId = setTimeout(async () => {
                // clear & prepare
                timeoutId = null;
                const entries = Array.from(map.entries());
                map.clear();
                const args = entries.map(([key]) => deserialize<I>(key));

                // perform action
                const result = action(Array.from(args));
                let output: O[] | undefined;
                let error: any;
                if (result instanceof Promise) {
                    try {
                        output = await result;
                    } catch (err) {
                        error = err;
                    }
                } else {
                    output = result;
                }

                // handle result
                if (error) {
                    // got error, reject all promises
                    for (const [, handlers] of entries) {
                        for (const [, reject] of handlers) {
                            reject(error);
                        }
                    }
                    return;
                }

                if (output) {
                    // got output, resolve all promises
                    for (const [key, handlers] of entries) {
                        const arg = deserialize<I>(key);
                        const selected = output.find(o => select(arg, o));
                        if (selected) {
                            for (const [resolve] of handlers) {
                                resolve(selected);
                            }
                        }
                    }
                }
            }, duration);
        });
    };
}

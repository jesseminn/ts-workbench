import { PromiseResolve, PromiseReject } from '../types';

export type BatchOptions<I, O> = {
    type?: 'debounce' | 'timeout';
    duration?: number;
    select?: (i: I, o: O) => boolean;
};

export function batch<I, O>(action: (args: I[]) => O[] | Promise<O[]>, options?: BatchOptions<I, O>) {
    const type = options?.type ?? 'debounce';
    const duration = options?.duration ?? 20;
    // silence TS2367: comparison appears to be unintentional
    const select = options?.select ?? ((i, o) => i === (o as any));

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const map = new Map<I, Array<[PromiseResolve<O>, PromiseReject]>>();

    return function (arg: I): Promise<O> {
        return new Promise<O>((resolve, reject) => {
            if (!map.has(arg)) {
                map.set(arg, [[resolve, reject]]);
            } else {
                const resolves = map.get(arg)!;
                resolves.push([resolve, reject]);
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
                timeoutId = null;
                const entries = Array.from(map.entries());
                map.clear();
                const args = entries.map(([arg]) => arg);
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
                if (error) {
                    for (const [, handlers] of entries) {
                        for (const [, reject] of handlers) {
                            reject(error);
                        }
                    }
                    return;
                }
                if (output) {
                    for (const [arg, handlers] of entries) {
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

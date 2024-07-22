import { randomBetween } from '../random';
import { Avoid } from '../types';
import { uid } from '../uid';

export type RetryOptions = {
    base: number;
    cap?: number;
    attempts?: number;
    jitter?: JitterStrategy;
    // TODO:
    // timeout?: number;
    signal?: AbortSignal;
    debug?: boolean;
};

type JitterStrategy = 'full' | 'equal' | 'decorrelated';

type RetryContext = {
    id: string;
    count: number;
    backoff: number;
    abort: (reason?: unknown) => never;

    // --- private props, should not expose to retry fn --- //
    _: {
        signal: AbortSignal;
        error?: unknown;
    };
};

type RetryFn<O> = (ctx: Avoid<RetryContext, '_'>) => O;

/**
 * When a `RetryAbortError` is caught, you may find the latest error
 * from the `latest` prop.
 */
export class RetryAbortError extends Error {
    constructor(
        public readonly reason?: unknown,
        public latest?: unknown,
    ) {
        super('RetryAbortError');
    }
}

async function _retry<O>(fn: RetryFn<O>, options: RetryOptions, _ctx?: RetryContext): Promise<O> {
    const cap = options.cap ?? Infinity;
    const base = options.base;
    const attempts = options.attempts ?? Infinity;
    const jitter = options.jitter ?? 'full';
    const controller = _ctx?._.signal || options.signal ? null : new AbortController();
    const signal = _ctx?._.signal || options.signal || controller!.signal;

    const ctx: RetryContext = _ctx || {
        id: uid(),
        count: 0,
        backoff: 0,
        abort: reason => {
            throw new RetryAbortError(reason);
        },

        _: {
            signal,
        },
    };

    ctx.count += 1;

    // init a new `log` for every recursion
    const label = `retry@${ctx.id}#${ctx.count}`;
    const log: typeof console.log = (...args) => {
        if (!options.debug) return;
        console.log(label, ...args);
    };

    return new Promise<O>((resolve, reject) => {
        if (ctx._.signal.aborted) {
            // this should not happen
            return reject('aborted');
        }

        const onAbort = () => {
            log('signal onAbort, will reject');
            reject(new RetryAbortError(ctx._.signal.reason));
        };
        ctx._.signal.addEventListener('abort', onAbort, { once: true });

        const cleanup = () => {
            log('cleanup');
            ctx._.signal.removeEventListener('abort', onAbort);

            if (backoffId !== null) {
                clearTimeout(backoffId);
                backoffId = null;
            }
        };

        const run = () => {
            // fn could be either sync or async, make it async
            const asyncFn = asyncify(fn);
            const { _, ...rest } = ctx;
            asyncFn(rest)
                .then(res => {
                    cleanup();
                    resolve(res);
                    return res;
                })
                .catch((err: unknown) => {
                    // why don't cleanup in `.finally`?
                    // because a promise is returned in `.catch`, which prevents
                    // `.finally` from being called
                    cleanup();

                    if (err instanceof RetryAbortError) {
                        log('got abort error');
                        // append previous error so the error could be handled properly
                        err.latest = ctx._.error;
                        reject(err);
                        return;
                    }

                    if (ctx.count === attempts) {
                        log('max attempts reached');
                        reject(err);
                        return;
                    }

                    ctx._.error = err;

                    ctx.backoff = exponentialBackoff(base, cap, ctx.count, jitter, ctx.backoff);
                    return _retry(fn, options, ctx);
                });
        };

        let backoffId: ReturnType<typeof setTimeout> | null = null;
        if (typeof ctx.backoff === 'number' && ctx.backoff !== 0) {
            backoffId = setTimeout(run, ctx.backoff);
        } else {
            run();
        }
    });
}

export async function retry<O>(fn: RetryFn<O>, options: RetryOptions) {
    // hide the `_ctx` arg
    return _retry(fn, options);
}

// create thunk, which allows you to call it later
// won't be able to access retry ctx
retry.thunk = <I extends Array<unknown>, O>(fn: (...args: I) => O, options: RetryOptions) => {
    return (...args: I): Promise<O> => {
        return retry(() => fn(...args), options);
    };
};

// utils

// got backoff duration
const exponentialBackoff = (base: number, cap: number, count: number, jitter: JitterStrategy, prev: number): number => {
    switch (jitter) {
        case 'full':
            return randomBetween(0, Math.min(cap, base * 2 ** count));
        case 'equal':
            const backoff = Math.min(cap, base * 2 ** count);
            return randomBetween(backoff / 2, backoff);
        case 'decorrelated':
            return Math.min(cap, randomBetween(base, prev * 3));
    }
};

// turn a function into an async one
const asyncify = <I extends Array<unknown>, O>(fn: (...args: I) => O): ((...args: I) => Promise<O>) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            try {
                const result = fn(...args);
                if (result instanceof Promise) {
                    result.then(resolve, reject);
                } else {
                    resolve(result);
                }
            } catch (err) {
                reject(err);
            }
        });
    };
};

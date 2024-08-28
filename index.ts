import { random } from './src/random';
import { RetryAbortError, retry } from './src/retry';

type PlaceOrderBody = {
    amount: number;
    price: number;
};

type PlaceOrderResponse = {
    id: number;
};

// mimic an api call
const placeOrder = async (order: PlaceOrderBody, signal?: AbortSignal) => {
    const log: typeof console.log = (...args) => {
        console.log('[placeOrder] ', ...args);
    };

    log('placing order, waiting');

    let removeAbortListener: (() => void) | undefined;
    return new Promise<PlaceOrderResponse>((resolve, reject) => {
        const id = setTimeout(
            () => {
                // const n = Math.random();
                const n = 0.5;

                // success
                if (n > 0.8) {
                    log('success');
                    resolve({
                        id: 123,
                    });
                    return;
                }

                // faled, but can retry
                if (n > 0.3) {
                    console.log('order failded');
                    reject(new Error('order failed'));
                    return;
                }

                // fatal error, cannot retry
                console.log('system error');
                reject(new Error('system error'));
            },
            random(500, 1500),
        );

        if (signal) {
            const onAbort = () => {
                () => {
                    log('place order got abort signal');
                    reject('abort');
                    clearTimeout(id);
                };
            };
            signal.addEventListener('abort', onAbort);
            removeAbortListener = () => signal.removeEventListener('abort', onAbort);
        }
    }).finally(() => {
        log('finally');
        removeAbortListener?.();
    });
};

// example 1
const retryPlaceOrder = async (body: PlaceOrderBody) => {
    const log: typeof console.log = (...args) => {
        console.log('[retryPlaceOrder] ', ...args);
    };

    const controller = new AbortController();

    // mimic the abort signal is triggered externally for a particular reason
    const id = setTimeout(() => {
        log('Abort from external');
        controller.abort('external');
    }, 3000);

    return retry(
        async ctx => {
            log('ctx ', ctx);
            try {
                return await placeOrder(body, controller.signal);
            } catch (err) {
                if (err instanceof Error && err.message === 'system error') {
                    // can do this
                    throw new RetryAbortError(err);
                    // or this
                    // throw ctx.abort(err.message);
                } else {
                    throw err;
                }
            }
        },
        {
            base: 500,
            signal: controller.signal,
            attempts: 3,
            // timeout: 3000,
            debug: true,
        },
    ).finally(() => {
        log('finally');
        clearTimeout(id);
    });
};

retryPlaceOrder({
    amount: 1,
    price: 100,
})
    .then(res => {
        console.log('retry place order success', res);
    })
    .catch(err => {
        console.log('retry place order error', err);

        if (err instanceof RetryAbortError) {
            console.log('retry aborted');
            console.log('the latest error is', err.latest);
        }
    });

/*
import { AbortError, retry } from '.';
import { random } from '../random';

// mock an existing api
type PlaceOrderBody = {
    amount: number;
    price: number;
};

type PlaceOrderResponse = {
    id: number;
};

const placeOrder = async (order: PlaceOrderBody) => {
    return new Promise<PlaceOrderResponse>((resolve, reject) => {
        setTimeout(
            () => {
                console.log('placing order', order);
                const n = Math.random();
                console.log('n', n);

                // success
                if (n > 0.8) {
                    resolve({
                        id: 123,
                    });
                    return;
                }

                // faled, but can retry
                if (n > 0.3) {
                    console.log('order failded');
                    reject(new Error('order failed'));
                    return;
                }

                // fatal error, cannot retry
                console.log('system error');
                reject(new Error('system error'));
            },
            random(500, 1500),
        );
    });
};

// example 1
const retryPlaceOrder = async (body: PlaceOrderBody) => {
    const controller = new AbortController();

    const id = setTimeout(() => {
        controller.abort("Time's up!!");
    }, 5000);

    return retry(
        async ctx => {
            console.log('ctx:: ', ctx);
            try {
                return await placeOrder(body);
            } catch (err) {
                if (err instanceof Error && err.message === 'system error') {
                    clearTimeout(id);
                    // can do this
                    // throw new AbortError(err.message);
                    // or this
                    ctx.abort(err.message);
                } else {
                    throw err;
                }
            }
        },
        {
            base: 500,
            signal: controller.signal,
        },
    );
};
// retryPlaceOrder({
//     amount: 1,
//     price: 100,
// })
//     .then(res => {
//         console.log('retry place order success', res);
//     })
//     .catch(err => {
//         console.log('retry place order error', err);
//     });

// example 2
const retryPlaceOrder2 = retry.thunk(placeOrder, { base: 1000 });
// retryPlaceOrder2({ amount: 1, price: 100 });

// example 3
const controller = new AbortController();
const retryPlaceOrder3 = retry.thunk(
    async (body: PlaceOrderBody) => {
        return placeOrder(body).catch(err => {
            if (err instanceof Error && err.message === 'system error') {
                throw new AbortError(err.message);
            } else {
                throw err;
            }
        });
    },
    { base: 1000, signal: controller.signal },
);
// after abort, `retryPlaceOrder3` won't be able to run again
// controller.abort('force abort!');

// Example: retry a synchronous action
const bet = (amount: number) => {
    console.log('Start!');

    // const num = Math.random();
    const num = 0.1;
    console.log('num', num);

    if (num > 0.8) {
        console.log('win!');
        return amount * 2;
    }

    if (num > 0.3) {
        throw new Error('even');
    }

    throw new Error('failed');
};

const retryBet = (amount: number) => {
    return retry(
        ctx => {
            try {
                return bet(amount);
            } catch (err) {
                if (err instanceof Error && err.message === 'failed') {
                    // FIXME: workaround...
                    // adding a throw here to make the return type of `retryBet`
                    // to be `Promise<number>` instead of `Promise<number | undefined>`
                    throw ctx.abort(err.message);
                } else {
                    throw err;
                }
            }
        },
        {
            base: 500,
            jitter: 'full',
            attempts: 5,
            debug: true,
        },
    );
};
*/

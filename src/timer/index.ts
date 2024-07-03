/**
 * Same behavior as RxJS `timer` operator
 * ref: https://www.learnrxjs.io/learn-rxjs/operators/creation/timer
 */
export const setTimer = (callback: () => unknown | Promise<unknown>, timeout?: number, interval?: number) => {
    let timerId: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;
    let timerType: 'timeout' | 'interval' = 'timeout';
    let isRunning = false;

    const runCallback = () => {
        if (isRunning) {
            // console.log('Timer callback is running');
            return;
        }

        isRunning = true;

        const result = callback();
        if (result instanceof Promise) {
            result.finally(() => {
                // console.log('callback is done');
                isRunning = false;
            });
        } else {
            // console.log('callback is finished');
            isRunning = false;
        }
    };

    timerId = setTimeout(() => {
        runCallback();

        if (typeof interval === 'number') {
            timerType = 'interval';
            timerId = setInterval(runCallback, interval);
        }
    }, timeout);

    return () => {
        switch (timerType) {
            case 'timeout':
                clearTimeout(timerId);
                break;
            case 'interval':
                clearInterval(timerId);
                break;
        }
    };
};

/**
 * This is similar to native `setInterval` but it starts the timer on "exact time".
 *
 * For example, if the timer delays 1min, it starts timer on the start of next minute
 */
export const setExactInterval = (callback: () => unknown | Promise<unknown>, interval: number) => {
    const now = Date.now();
    const timeToStart = (Math.floor(now / interval) + 1) * interval - now;
    return setTimer(callback, timeToStart, interval);
};

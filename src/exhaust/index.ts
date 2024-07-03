export function exhaust<I extends unknown[], O>(fn: (...i: I) => O) {
    let isRunning = false;

    return function (...i: I): O | undefined {
        if (isRunning) {
            return;
        }

        isRunning = true;

        const result = fn(...i);
        if (result instanceof Promise) {
            result.finally(() => {
                isRunning = false;
            });
        } else {
            isRunning = false;
        }

        return result;
    };
}

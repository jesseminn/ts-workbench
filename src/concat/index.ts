export function concat<I extends unknown[], O>(fn: (...i: I) => O) {
    let promise: Promise<O> | undefined;

    return function (...i: I): O {
        if (!promise) {
            const output = fn(...i);
            if (output instanceof Promise) {
                promise = output;
                return output;
            } else {
                return output;
            }
        } else {
            promise = promise.then(() => {
                const output = fn(...i);
                if (output instanceof Promise) {
                    return output;
                } else {
                    return output;
                }
            });
            return promise as O;
        }
    };
}

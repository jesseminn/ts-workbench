export class WaitAbortError extends Error {
    constructor(public readonly reason: unknown) {
        super('WaitAbortError');
    }
}

export async function wait(duration: number, signal?: AbortSignal) {
    let onAbort: (() => void) | undefined;
    return new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => {
            resolve();
        }, duration);

        if (signal) {
            onAbort = () => {
                clearTimeout(id);
                reject(new WaitAbortError(signal.reason));
            };
            signal.addEventListener('abort', onAbort, { once: true });
        }
    }).finally(() => {
        if (signal && onAbort) {
            signal.removeEventListener('abort', onAbort);
        }
    });
}

export const nextFrame = () => {
    return new Promise(resolve => {
        if (requestAnimationFrame) {
            requestAnimationFrame(resolve);
        } else if (setImmediate) {
            setImmediate(resolve);
        } else {
            setTimeout(resolve, 0);
        }
    });
};

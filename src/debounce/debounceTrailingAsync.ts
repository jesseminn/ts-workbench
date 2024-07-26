import { DebouncedError } from './types';

export function debounceTrailingAsync<I extends Array<unknown>, O>(fn: (...args: I) => Promise<O>, duration: number) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let currentReject: ((reason?: any) => void) | null = null;
    return (...args: I) => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
        if (currentReject) {
            currentReject?.(new DebouncedError());
            currentReject = null;
        }
        return new Promise<O>((resolve, reject) => {
            currentReject = reject;
            timer = setTimeout(() => {
                fn(...args)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                        // even the callback runs, it still could be aborted if another call happens
                        timer = null;
                        currentReject = null;
                    });
            }, duration);
        });
    };
}

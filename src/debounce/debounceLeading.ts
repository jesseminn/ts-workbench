import { DebouncedError } from './types';

export function debounceLeading<I extends Array<unknown>, O>(
    fn: (...args: I) => O,
    duration: number,
): (...args: I) => O extends Promise<any> ? O | Promise<never> : O | undefined {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    // type definition is hard
    let result: any;

    return (...args) => {
        if (timeoutId === null) {
            result = fn(...args);
            timeoutId = setTimeout(() => {
                timeoutId = null;
                result = undefined;
            }, duration);
            return result;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                timeoutId = null;
                result = undefined;
            }, duration);
            if (result instanceof Promise) {
                return Promise.reject(new DebouncedError());
            } else {
                return undefined;
            }
        }
    };
}

import { debounceLeading } from './debounceLeading';
import { DebouncedError } from './types';
import { wait } from '../wait';

jest.useFakeTimers();

describe('debounceLeading', () => {
    const fn = jest.fn(async () => {
        await wait(1000);
        return 42;
    });
    const debouncedFn = debounceLeading(fn, 3000);
    it('should call the function once', () => {
        expect(debouncedFn()).resolves.toBe(42);
        expect(debouncedFn()).rejects.toBeInstanceOf(DebouncedError);
        expect(fn.mock.calls.length).toBe(1);
    });
});

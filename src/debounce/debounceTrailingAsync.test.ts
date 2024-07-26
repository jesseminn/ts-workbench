import { debounceTrailingAsync } from './debounceTrailingAsync';
import { wait } from '../wait';
import { DebouncedError } from './types';

jest.useFakeTimers();

describe('debounceTrailingAsync', () => {
    it('should only resolve the latest call', () => {
        const fn = jest.fn(async () => {
            await wait(1000);
            return 42;
        });
        const debouncedFn = debounceTrailingAsync(fn, 3000);
        expect(debouncedFn()).rejects.toBeInstanceOf(DebouncedError);
        expect(debouncedFn()).rejects.toBeInstanceOf(DebouncedError);
        expect(debouncedFn()).resolves.toBe(42);
    });
});

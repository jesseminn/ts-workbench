import { memoize } from '.';

jest.useFakeTimers();

describe('memoize', () => {
    const _fn = jest.fn((input: string) => {
        return input.toUpperCase();
    });

    beforeEach(() => {
        _fn.mockClear();
    });

    it('should get called once', () => {
        const fn = memoize(_fn);
        fn('foo');
        fn('foo');
        expect(_fn).toHaveBeenCalledTimes(1);
    });

    it('should get called twice', () => {
        const fn = memoize(_fn, {
            ttl: 1000,
        });
        fn('foo');
        jest.advanceTimersByTime(2000);
        fn('foo');

        expect(_fn).toHaveBeenCalledTimes(2);
    });

    it('should get called twice', () => {
        const fn = memoize(_fn);
        fn('foo');
        fn.delete('foo');
        fn('foo');
        expect(_fn).toHaveBeenCalledTimes(2);
    });
});

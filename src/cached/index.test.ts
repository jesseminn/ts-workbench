import { Cached } from '.';

jest.useFakeTimers();

const cached = new Cached<number>();

describe('cached', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });

    it('should not be expired', () => {
        const key = 'foo';
        cached.set(key, 42, 1000);
        jest.advanceTimersByTime(500);
        expect(cached.has(key)).toBe(true);
    });

    it('should be expired', () => {
        const key = 'foo';
        cached.set(key, 42, 1000);
        jest.advanceTimersByTime(1500);
        expect(cached.has(key)).toBe(false);
    });
});

import { random } from './random';

describe('random', () => {
    it('should return a number between 0 & 1', () => {
        const result = random();
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });

    it('should return a number between -10 & 20', () => {
        const result = random([-10, 20]);
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(20);
    });
});

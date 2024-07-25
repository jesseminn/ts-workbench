import { randomInt } from './randomInt';

describe('randomInt', () => {
    it('should return a number between -10 & 20', () => {
        const result = randomInt([-10, 20]);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(20);
    });
});

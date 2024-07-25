import { randomString } from './randomString';

describe('randomString', () => {
    it('should return an 8-character string', () => {
        const result = randomString(8);
        expect(typeof result).toBe('string');
        expect(result.length).toBe(8);
    });

    it('should return an 8-character string from a charset', () => {
        const result = randomString(8, '!@#$%^&*');
        expect(typeof result).toBe('string');
        expect(/[!@#$%^&*]{8}/.test(result)).toBe(true);
    });
});

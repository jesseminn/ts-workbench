import { base64 } from '.';
import { randomInt, randomString } from '../random';

describe('base64', () => {
    const inputs = Array.from(Array(5)).map(() => randomString(randomInt([1, 100])));
    it.each(inputs)('should encode and decode %s', input => {
        const encoded = base64.encode(input);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(input);
    });
});

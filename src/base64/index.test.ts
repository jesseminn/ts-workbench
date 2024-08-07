import { base64 } from '.';
import { randomString } from '../random';

describe('base64', () => {
    it('should encode and decode', () => {
        const input = randomString(8);
        const encoded = base64.encode(input);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(input);
    });
});

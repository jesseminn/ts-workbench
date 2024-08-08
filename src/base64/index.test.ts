import { base64 } from '.';
import { randomInt, randomString } from '../random';

describe('base64', () => {
    it('should encode and decode', () => {
        const inputs = Array.from(Array(100)).map(() => randomString(randomInt([1, 100])));
        const failedIndex = inputs
            .map(input => {
                const encoded = base64.encode(input);
                const decoded = base64.decode(encoded);
                return input === decoded;
            })
            .findIndex(v => v === false);

        if (failedIndex !== -1) {
            console.log('failed at', inputs[failedIndex]);
        }

        expect(failedIndex).toBe(-1);
    });
});

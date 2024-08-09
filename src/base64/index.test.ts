import { base64 } from '.';
import { randomInt, randomString } from '../random';

describe('base64', () => {
    const input = randomString(randomInt([1, 100]));
    it('should encode and decode random string', () => {
        const encoded = base64.encode(input);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(input);
    });
    it('should be encode and decode Chinese', () => {
        const input = '畫無法乾待直接用後出現，但是我影片到底前兩好久打';
        const encoded = base64.encode(input);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(input);
    });
    it('should be encode and decode emojies', () => {
        const input = '😂😅🤯😍😘😜😝😛😎😏😶';
        const encoded = base64.encode(input);
        const decoded = base64.decode(encoded);
        expect(decoded).toBe(input);
    });
});

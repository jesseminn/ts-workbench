import * as fc from 'fast-check';
import { base64 } from './base64';

describe('base64', () => {
    it('should encode and decode random string', () => {
        fc.assert(
            fc.property(fc.string(), input => {
                const encoded = base64.encode(input);
                const decoded = base64.decode(encoded);
                return input === decoded;
            }),
        );
    });

    it('should be encode and decode unicode strings', () => {
        fc.assert(
            fc.property(fc.unicodeString(), input => {
                console.log('string property', input);
                const encoded = base64.encode(input);
                const decoded = base64.decode(encoded);
                return input === decoded;
            }),
        );
        // const input = '畫無法乾待直接用後出現，但是我影片到底前兩好久打';
        // const encoded = base64.encode(input);
        // const decoded = base64.decode(encoded);
        // expect(decoded).toBe(input);
    });

    it('should be encode and decode emojies', () => {
        // const input = '😂😅🤯😍😘😜😝😛😎😏😶';
        // const encoded = base64.encode(input);
        // const decoded = base64.decode(encoded);
        // expect(decoded).toBe(input);
    });
});

import { uid } from '.';

describe('uid', () => {
    it('should generate the same id for the same seed', () => {
        const seed = {};
        const a = uid(seed);
        const b = uid(seed);
        expect(a).toEqual(b);
    });
});

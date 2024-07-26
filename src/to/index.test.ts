import { to } from '.';

jest.useFakeTimers();

describe('to', () => {
    it('should catch error', async () => {
        const [error, result] = await to(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('rejected!!'));
                }, 1000);
                jest.advanceTimersByTime(1000);
            }),
        );
        expect(error).toBeInstanceOf(Error);
        expect(result).toBe(undefined);
    });
});

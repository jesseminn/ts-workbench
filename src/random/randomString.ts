import { randomInt } from './randomInt';

// ref: https://stackoverflow.com/a/1349426
// benchmark: https://measurethat.net/Benchmarks/Show/31464/0/generate-random-string
export const randomString = (() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const defaultCharset = `${lowercase}${uppercase}${digits}`;

    return (length: number, charset?: string | Array<string>) => {
        const _charset = charset || defaultCharset;

        let result = '';
        for (let i = 0; i < length; i++) {
            const id = randomInt([0, _charset.length - 1]);
            result += _charset[id];
        }
        return result;
    };
})();

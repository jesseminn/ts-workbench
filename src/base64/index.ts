const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const paddingChar = '=';

function encode(input: string): string {
    const paddings = 3 - (input.length % 3);
    const binaries = input
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('')
        .padEnd((input.length + paddings) * 8, '0');
    const chars = [];
    for (let i = 0; i < binaries.length; i += 6) {
        const chunk = binaries.slice(i, i + 6);
        const index = parseInt(chunk, 2);
        const char = charset[index];
        chars.push(char);
    }
    for (let i = 0; i < paddings; i++) {
        chars[chars.length - 1 - i] = paddingChar;
    }
    return chars.join('');
}

function decode(input: string): string {
    const paddingIndex = input.indexOf(paddingChar);
    const paddings = paddingIndex === -1 ? 0 : input.length - paddingIndex;
    const binaries = input
        .split('')
        .map(char => {
            let index: number;
            if (char === paddingChar) {
                index = charset.indexOf('A');
            } else {
                index = charset.indexOf(char);
            }
            return index.toString(2).padStart(6, '0');
        })
        .join('');
    const chars = [];
    for (let i = 0; i < binaries.length; i += 8) {
        const chunk = binaries.slice(i, i + 8);
        const index = parseInt(chunk, 2);
        const char = String.fromCharCode(index);
        chars.push(char);
    }
    return chars.slice(0, chars.length - paddings).join('');
}

export const base64 = {
    encode,
    decode,
};

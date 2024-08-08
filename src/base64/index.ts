const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const paddingChar = '=';

function encode(input: string): string {
    const paddings = 3 - (input.length % 3 || 3);
    let encoded = '';
    let binaries = '';
    for (let i = 0; i < input.length + paddings; i++) {
        const char = input[i];
        const binary = char ? char.charCodeAt(0).toString(2).padStart(8, '0') : '00000000';
        const mod = binaries.length % 6;
        if (mod === 0) {
            encoded += charset[parseInt(binary.slice(0, 6), 2)];
            binaries = binary.slice(6);
        }
        if (mod === 2) {
            encoded += charset[parseInt(`${binaries}${binary.slice(0, 4)}`, 2)];
            binaries = binary.slice(4);
        }
        if (mod === 4) {
            if (paddings === 1) {
                if (!char) {
                    encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                    encoded += paddingChar;
                } else {
                    encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                    encoded += charset[parseInt(binary.slice(2), 2)];
                }
            } else if (paddings === 2) {
                if (!input[i - 1]) {
                    encoded += paddingChar;
                    encoded += paddingChar;
                } else {
                    encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                    encoded += charset[parseInt(binary.slice(2), 2)];
                }
            } else {
                // no padding
                encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                encoded += charset[parseInt(binary.slice(2), 2)];
            }
            binaries = '';
        }
    }

    return encoded;
}

function decode(input: string): string {
    let decoded = '';
    let binaries = '';
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === paddingChar) {
            return decoded;
        }
        const code = charset.indexOf(char);
        const binary = code.toString(2).padStart(6, '0');
        const mod = binaries.length % 8;
        if (mod === 0) {
            binaries += binary;
        }
        if (mod === 2) {
            decoded += String.fromCharCode(parseInt(`${binaries}${binary}`, 2));
            binaries = '';
        }
        if (mod === 4) {
            decoded += String.fromCharCode(parseInt(`${binaries}${binary.slice(0, 4)}`, 2));
            binaries = binary.slice(4);
        }
        if (mod === 6) {
            decoded += String.fromCharCode(parseInt(`${binaries}${binary.slice(0, 2)}`, 2));
            binaries = binary.slice(2);
        }
    }
    return decoded;
}

export const base64 = {
    encode,
    decode,
};

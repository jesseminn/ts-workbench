const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const paddingChar = '=';

function encode(input: string): string {
    const paddings = 3 - (input.length % 3 || 3);
    let encoded = '';
    let binaries = '';
    for (let i = 0; i < input.length + paddings; i++) {
        const char = input[i];
        const binary = char ? char.charCodeAt(0).toString(2).padStart(8, '0') : '00000000';
        // the binaries length could only be 0, 2 or 4 because the bits will be consumed once become 6
        switch (binaries.length) {
            case 0:
                encoded += charset[parseInt(binary.slice(0, 6), 2)];
                binaries = binary.slice(6);
                break;
            case 2:
                encoded += charset[parseInt(`${binaries}${binary.slice(0, 4)}`, 2)];
                binaries = binary.slice(4);
                break;
            case 4:
                // the paddings count could only be 0, 1 or 2
                switch (paddings) {
                    case 0:
                        encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                        encoded += charset[parseInt(binary.slice(2), 2)];
                        break;
                    case 1:
                        // when there's only one padding and current char is undedefined (exceeded input string ranged)
                        // which means the last char is a padding char
                        if (!char) {
                            encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                            encoded += paddingChar;
                        } else {
                            encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                            encoded += charset[parseInt(binary.slice(2), 2)];
                        }
                        break;
                    case 2:
                        // when there are 2 paddings and previous char is undedefined (exceeded input string ranged)
                        // which means the last 2 chars are padding chars
                        if (!input[i - 1]) {
                            encoded += paddingChar;
                            encoded += paddingChar;
                        } else {
                            encoded += charset[parseInt(`${binaries}${binary.slice(0, 2)}`, 2)];
                            encoded += charset[parseInt(binary.slice(2), 2)];
                        }
                        break;
                }
                binaries = '';
                break;
        }
    }

    return encoded;
}

function decode(input: string): string {
    let decoded = '';
    let binaries = '';
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        // once reached the padding char, don't need to continue the loop
        if (char === paddingChar) {
            break;
        }
        const code = charset.indexOf(char);
        const binary = code.toString(2).padStart(6, '0');
        // binaries length could only be 0, 2, 4 or 6 because the bits will be consumed once become 8
        switch (binaries.length) {
            case 0:
                binaries += binary;
                break;
            case 2:
                decoded += String.fromCharCode(parseInt(`${binaries}${binary}`, 2));
                binaries = '';
                break;
            case 4:
                decoded += String.fromCharCode(parseInt(`${binaries}${binary.slice(0, 4)}`, 2));
                binaries = binary.slice(4);
                break;
            case 6:
                decoded += String.fromCharCode(parseInt(`${binaries}${binary.slice(0, 2)}`, 2));
                binaries = binary.slice(2);
                break;
        }
    }
    return decoded;
}

export const base64 = {
    encode,
    decode,
};

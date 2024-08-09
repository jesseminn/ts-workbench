// encode any utf-8 char into normal
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encode(input: string) {
    const data = encoder.encode(input);
    let result = '';
    data.forEach(d => {
        result += String.fromCharCode(d);
    });
    return result;
}

function decode(input: string) {
    const data = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
        data[i] = input.charCodeAt(i);
    }
    return decoder.decode(data);
}

export const utf8 = {
    encode,
    decode,
};

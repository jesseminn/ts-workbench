import { random } from './random';

// ref: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
export const randomInt = (range: [number, number]) => {
    const min = Math.ceil(Math.min(...range));
    const max = Math.floor(Math.max(...range));
    return Math.floor(random() * (max - min + 1)) + min;
};

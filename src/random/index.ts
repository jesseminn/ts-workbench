// TODO: study true random number
// https://blog.logrocket.com/building-random-number-generator-javascript-nodejs/
export const random = (start: number, end: number): number => {
    const delta = end - start;
    return start + delta * Math.random();
};

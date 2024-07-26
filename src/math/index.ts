export const inBetween = (range: [number, number], value: number) => {
    const min = Math.min(...range);
    const max = Math.max(...range);
    return min <= value && value <= max;
};

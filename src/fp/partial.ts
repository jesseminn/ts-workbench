type Arr = readonly unknown[];

export function partial<Heads extends Arr, Tails extends Arr, R>(
    f: (...args: [...Heads, ...Tails]) => R,
    ...heads: Heads
) {
    return (...tails: Tails) => f(...heads, ...tails);
}

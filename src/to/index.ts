// Same as `await-to-js`, just improved type definition
// Moved
// ref: https://github.com/scopsy/await-to-js/blob/master/src/await-to-js.ts
export async function to<E = Error, T = unknown>(promise: Promise<T>): Promise<[null, T] | [E, undefined]> {
    try {
        const result = await promise;
        return [null, result] as const;
    } catch (err) {
        return [err as E, undefined] as const;
    }
}

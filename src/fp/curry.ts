type SameLength<T extends any[]> = Extract<{ [K in keyof T]: any }, any[]>;
type Curried<A extends any[], R> = <P extends Partial<A>>(
    ...args: P
) => P extends A ? R : A extends [...SameLength<P>, ...infer S] ? (S extends any[] ? Curried<S, R> : never) : never;
type AnyFunction = (...args: any) => any;
export function curry<A extends any[], R>(fn: (...args: A) => R): Curried<A, R> {
    return (...args: any[]): any =>
        args.length >= fn.length ? fn(...(args as any)) : curry((fn as AnyFunction).bind(undefined, ...args));
}

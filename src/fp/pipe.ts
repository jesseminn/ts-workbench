type AnyFunction = (...args: any) => any;
type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
    ? []
    : ((...b: T) => void) extends (a: any, ...b: infer I) => void
      ? I
      : [];

type LastFromTuple<T extends any[]> = T[RemoveFirstFromTuple<T>['length']];
type Chainable2<Fn1 extends AnyFunction, Fn2 extends AnyFunction> =
    [ReturnType<Fn1>] extends Parameters<Fn2> ? true : false;
type Chainable<Fns extends AnyFunction[]> = Fns[1] extends AnyFunction
    ? Chainable2<Fns[0], Fns[1]> extends true
        ? Chainable<RemoveFirstFromTuple<Fns>>
        : false
    : true;
export function pipe<Fns extends AnyFunction[]>(
    ...fns: [...Fns]
): Chainable<Fns> extends true ? (...input: Parameters<Fns[0]>) => ReturnType<LastFromTuple<Fns>> : unknown {
    return fns.reduce((prevFn, nextFn) => value => nextFn(prevFn(value)) as unknown, fns[0]);
}

// const fn = pipe(
//     (v: string) => Number(v),
//     (v: number) => v * 2,
//     (v: boolean) => `${v}`
// )

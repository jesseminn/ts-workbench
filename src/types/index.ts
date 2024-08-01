export type Predicate = (...args: Array<any>) => boolean;
export type Project<A, B = A> = (x: A) => B;
export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
export type PromiseReject = (reason?: any) => void;
/**
 * Returns true if a & b are equal
 */
export type Equal<A = unknown, B = A> = (a: A, b: B) => boolean;
/**
 * Returns true if a & b are not equal
 */
export type Unequal<A = unknown, B = A> = (a: A, b: B) => boolean;

/**
 * Type the result of `Object.entries`
 * 
 * @example
 * ```ts
 * type User = { name: string, age: number }
 * const user: User = { name: 'John Doe', age: 40 }
 * 
 * // Object.entries is not typed wll
 * Object.entries(user).forEach(([key, value]) => {
 *      switch (key) {
 *          case 'name':
 *              // error, value is string | number
 *              console.log(value.toUpperCase());
 *              break;
 *          case 'age':
 *              // error, value is string | number
 *              console.log(value.toFixed())
 *              break;
 *      }
 *  });

 *  (Object.entries(user) as ObjectEntries<User>).forEach(([key, value]) => {
 *      switch (key) {
 *          case 'name':
 *              // value is string
 *              console.log(value.toUpperCase());
 *              break;
 *          case 'age':
 *              // value is number
 *              console.log(value.toFixed())
 *              break;
 *      }
 *  });
 * ```
 */
export type ObjectEntries<T> = [keyof T, T[keyof T]][];

/**
 * Type the result of `Object.keys`
 *
 * @example
 * ```ts
 * const obj = { foo: '', bar: 42, baz: false };
 * // keys is 'foo' | 'bar' | 'baz';
 * const keys = Object.keys(obj) as ObjectKeys<typeof obj>;
 *
 * ```
 */
export type ObjectKeys<T> = Array<keyof T>;

/**
 * Make all props transient.
 * Ref: https://styled-components.com/docs/api#transient-props
 */
export type TransientProps<T extends Record<string, any>> = {
    [K in keyof T as K extends string ? `$${K}` : K]: T[K];
};

/**
 * Remove the `$` prefix from styled components' transient props.
 */
export type IntransientProps<T extends Record<string, any>> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : K]: T[K];
};

/**
 * Pick styled components' transient props and remove the `$` prefix.
 */
export type PickTransientProps<T extends Record<string, any>, Keys extends keyof T> = {
    [K in Keys as K extends `$${infer Rest}` ? Rest : K]: T[K];
};

/**
 * Make some props required.
 *
 * ```ts
 * type P = { a?: string; b: number; c?: boolean; };
 * type Q = Require<P, 'a' | 'c'>;
 * declare const q:  Q
 * q.a; // string, no undefined
 * ```
 *
 */
export type Require<T extends Record<string, any>, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: T[P];
};

/**
 * Make some props optional.
 *
 * ```ts
 * type P = {
 *      a: string,
 *      b: boolean,
 *  }
 *
 *  type Q = Optional<P, 'a'>;
 * ```
 */
export type Optional<T extends Record<string, any>, K extends keyof T = keyof T> = Omit<T, K> & {
    [P in K]+?: T[P];
};

/**
 * An improved `Omit`, which can know is `K` is a key of `T` or not
 */
export type Avoid<T extends Record<string, any>, K extends keyof T> = Omit<T, K>;

export type Override<T extends Record<string, any>, K extends Partial<T>> = Omit<T, keyof K> & K;

export type StrictExtract<T, U extends T> = U extends T ? U : never;

/**
 * ```ts
 * function foo<T>(v: NotPromise<T>) {}
 * // type error
 * foo(new Promise(() => {}))
 * // ok
 * foo(42);
 * ```
 */
export type NotPromise<T> = T extends Promise<unknown> ? never : T;

/**
 * ```ts
 * type X = string | Promise<number> | Promise<boolean>
 * // string
 * type Y = ExcludePromise<X>;
 * ```
 */
export type ExcludePromise<T> = Exclude<T, Promise<any>>;

## TODO

-   Handle serializing/deserializing native functions, e.g. `alert`
-   Might have API for adding support to unsupported objects.
-   Check this gist to improve deserilize functions
    -   https://gist.github.com/briancavalier/4a820b32e0d2abca89f7
    -   https://stackoverflow.com/questions/7395686/how-can-i-serialize-a-function-in-javascript
-   js built-in objects
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects

## What is serialize

[Definition from MDN](https://developer.mozilla.org/en-US/docs/Glossary/Serialization)

> The process whereby an object or data structure is translated into a format suitable for transfer over a network, or storage (e.g. in an array buffer or file format).

## What is POJO

The defenition of POJO varied, here's my conclusion:

-   An object created by `Object.create(null)`
-   Or an object is directly constructed by `Object` class. It could be

    -   Created by _object literal_
    -   Or created by [`new Object()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object)

References

-   https://gist.github.com/kurtmilam/a1179741777ea6f88374286a640829cc
-   https://masteringjs.io/tutorials/fundamentals/pojo

    This articles provides an `isPojo` util but I found it's has a pitfall:

    ```ts
    const o1 = { foo: 42 };
    const o2 = Object.create(o1);

    // 42, but `o2` does not have own `foo` prop
    o2.foo;
    // true, `o2`'s `[[Prototype]]` (`__proto__`) is `o1`
    Object.getPrototypeOf(o2) === o1;
    // true, but `o1` does not has `constructor` prop
    Object.getPrototypeOf(o2).constructor === 'Object';
    // true, it's because `o1.constructor` is from `Object.prototype.constructor`
    o1.constructor === Object.prototype.constructor;
    ```

    In the example, `o2` is not a POJO.

-   This article provides the solution https://adamcoster.com/blog/pojo-detector

## Why Iterable is not supported

By definition, an iterable is _anything_ which have or can access `Symbol.iterator` method, which should return an `Iterator`.

A string is also an iterable

```ts
typeof 'foo'[Symbol.iterator] === 'function'; // true
```

So there're 2 conditions

-   The object owns the `Symbol.iterator` method. Check this example from [MDN's iterator protocol intro](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#syntaxes_expecting_iterables)

    ```ts
    const obj = {
        [Symbol.iterator]() {
            let i = 0;
            return {
                next() {
                    i++;
                    if (i === 3) return { done: true, value: i };
                    return { done: false, value: i };
                },
                return() {
                    return { done: true, value: i };
                },
            };
        },
    };
    ```

    This can be serialized & deserialized, but the `Symbol.iterator` method will returns a _function caller_ after being deserialized,
    which does not matches the iteration protocol.

-   The object can access `Symbol.iterator` method through prototype chain, this is an **unsupported object**.

## Why `toJSON` is not supported

`JSON.stringify` will use the value returned by `toJSON` method,
`toJSON` is not support by `serialize` because the returned string from `toJSON` is not
guarenteed to be deserializeable. For example, `Date` has a built-in `toJSON` method:

```ts
const date = new Date();
typeof date.toJSON; // 'function'
date.toJSON(); // an ISON date string
const s = JSON.stringify(d); // '"2024-07-06T14:25:50.471Z"'
const d = JSON.parse(s); // '2024-07-06T14:25:50.471Z', not the original date object
```

## JSON reserved chars

JSON reserved chars https://stackoverflow.com/a/27516892

Usually `JSON.stringify` handles this,
will only occur if `JSON.parse` a string which is NOT produced by `JSON.stringify`,

## Reference

-   [This article](https://www.turing.com/kb/implementing-json-serialization-in-js) points out some features what `JSON.stringify` lacks
-   [`serialize-javascript`](https://github.com/yahoo/serialize-javascript)
-   [`serialize-closures`](https://www.npmjs.com/package/serialize-closures)
-   The [internal `stableStringify` util](https://github.com/facebookexperimental/Recoil/blob/main/packages/shared/util/Recoil_stableStringify.js) in Recoil

## Getting object keys

`Object.keys(obj)` returns **enumerable** **`string`** hkeys.

`Object.getOwnPropertyNames(obj)` returns **all** **`string`** keys.

`Object.getOwnPropertySymbols(obj)` returns **all** **`symbol`** keys.

`Reflect.ownKeys` returns **all** **`string` & `symbol`** keys. It's equivalent to

```ts
Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
```

ref: https://stackoverflow.com/a/34449216

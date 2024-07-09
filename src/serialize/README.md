# Serialize & deserialize

Should not be confused with Node.js `v8.serialize`, which returns a `Buffer`

-   Ref:
-   https://github.com/yahoo/serialize-javascript
-   https://github.com/facebookexperimental/Recoil/blob/main/packages/shared/util/Recoil_stableStringify.js

## TODO

also list what are not supported by JSON.stringify
deserialize function
circular reference

## Types can be deserialized after being serialized

`Symbol`

`Map`

`Set`

special numbers https://javascript.plainenglish.io/javascript-special-numbers-404dd5bf5f20
`Infinity` / `-Infinity`
`0` / `-0`
`NaN`

`BigInt`
`Date`
`Function`?
RegExp
POJO (plain old JavaScrpt object)

## Types cannot be deserialized

Promise. It's impossible to revive a promise.

Iterable. By definition, an iterable is _anything_ which can access `Symbol.iterator` method,
even through the prototype chain. Therefore, even a string is also an iterable.

So there're 2 conditions

    - The object owns the `Symbol.iterator` method

        ```ts
        const iterable = {
            [Symbol.iterator]() {
                // iterabion
            }
        }
        ```
    - The object can access `Symbol.iterator` method through prototype chain,
        this is an **unsupported object**

WeakMap? because Weak containers are unable to iterate over its content
WeakSet?

Objects which are NOT pojo

### Why `toJSON` is NOT used

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

## Keys are sorted

```ts
const x = { a: '', b: '' };
const y = { b: '', a: '' };
// false, but object's keys by definitions should be unordered
JSON.stringify(x) === JSON.stringify(y);
```

Therefore,

-   For maps & objects, sort the keys in a consistent order.
-   For sets, items are also sorted.

Ref for implementation:
https://github.com/facebookexperimental/Recoil/blob/main/packages/shared/util/Recoil_stableStringify.js#L76

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

## JSON reserved chars

JSON reserved chars https://stackoverflow.com/a/27516892

Usually `JSON.stringify` handles this,
will only occur if `JSON.parse` a string which is NOT produced by `JSON.stringify`,

## Others

[JSON5](https://github.com/json5/json5)

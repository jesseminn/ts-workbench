# Serialize & deserialize

A pair of function which can serialize & deserialize several data types.

`serialize` can turn a data into a string, while `deserialize` can recover a data from a seriailzed string.

## Features

### Supported data types which is not supported by `JSON.stringify` & `JSON.parse`

-   Special numbers: `Infinity`, `-Infinity`, `NaN`, `-0`
-   `symbol`
-   `bigint`
-   `Map`
-   `Set`
-   Other JavaScript built-in class instance, including `URL`, `RegExp` and `Date`
-   Functions (with workaround)

    ```ts
    const num = 42;
    function fn(name: string) {
        console.log(`${name} is ${num}`);
    }
    // undefined
    console.log(JSON.stringify(fn));
    // to rebuild closure, will returns a *caller* to the call the original function
    const _fn = deserialize(serialize(fn));
    // foo is 66
    _fn({ num: 66 })('foo');
    ```

-   Objects (only supports **POJO**)

### Unsupported data types

-   Native functions, such as `alert`
-   Object which are NOT a pojo.
-   Promise. It's impossible to revive a promise.
-   Iterable.
-   WeakMap & WeakSet. because Weak containers are unable to iterate over its content

### Stable order

Object keys, map keys & set items by definitions should be unordered.

```ts
const x = { a: '', b: '' };
const y = { b: '', a: '' };

// false
console.log(JSON.stringify(x) === JSON.stringify(y));

// true
console.log(serialize(x) === serialize(y));
```

In short,

-   For maps & objects, sort the keys in a consistent order.
-   For sets, items are also sorted.

This will be useful when you need to compare the difference between objects.
For example, avoid unnecessary re-render by comparing objects before actually setting state in a React component

```ts
fetchUserInfo(id).then(res => {
    setState(current => {
        const _current = serialize(current);
        const _next = serialize(res.data);
        if (_current === _next) {
            return current;
        } else {
            return res.data;
        }
    });
});
```

### Circular reference

```ts
const obj = {};
obj.self = obj;

// TypeError: Converting circular structure to JSON
console.log(JSON.stringify(obj));

const _obj = deserialize(serialize(obj));
// true
console.log(_obj.self === _obj);
```

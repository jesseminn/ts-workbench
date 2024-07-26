# `to`

Similat as [`await-to-js`](https://github.com/scopsy/await-to-js/blob/master/src/await-to-js.ts),
just improved type definition.

Because the resolve type can be inferred from the `promise`, usually you only want to defined the reject type.
However, the design of `await-to-js` requires you to declare both resolve & reject types.

By swapping the resolve and reject type, you only need to declare the error type.

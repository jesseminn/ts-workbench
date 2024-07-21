# Retry

## TODO

`options.timeout`

-   start a timeout at the first call
-   on timeout, emits a `RetryTimeoutError`
-   unsubscribe to the emitter at the end of every recursion
-   do not clear the timeout timer at the end of every recursion, clear on settle (resolved or caught abort err, timeout err or max attemp

## Eager mode

`retry` takes a function arg, it'll call the function arg immediately.

```ts
const placeOrder = (body: PlaceOrderBody): Promise<PlaceOrderResponse> => {};

// call `placeOrder` immediately
const res = await retry(placeOrder, { base: 1000 });
```

## Lazy mode

The `retry.thunk` is an HOF which allows you to decide when to call the function arg.

```ts
const submit = retry.thunk(placeOrder, { base: 1000 });

// call submit as you want
submit({ price: 100, amount: 1 });
```

Notice: when using `retry.thunk`, the function arg is unable to access the retry context.

## Context

The function arg of `retry` can acceess a context object.

```ts
const res = await retry(ctx => {
    try {
        return await place
    }
}, { base: 1000 });
```

## Abort

`retry` will abort once receive a `RetryAbortError`. There're various ways to abort a `retry`:

1. Call `ctx.abort`. It's a convenient way to throw a `RetryAbortError`.

    ```ts
    retry(
        async ctx => {
            try {
                await placeOrder();
            } catch (err) {
                if (err.code === 500) {
                    // Notice: `ctx.aobrt` itself already throws, but TypeScript is unable to recognize it
                    // add a throw here to make the type inference correct.
                    throw ctx.abort('system error');
                }
                throw err;
            }
        },
        {
            base: 1000,
        },
    );
    ```

2. Throw `RetryAbortError`. It's useful when you're unable to access `ctx`

    ```ts
    retry.thunk(
        body => {
            try {
                await placeOrder(body);
            } catch (err) {
                if (err.code === 500) {
                    // Notice: `ctx.aobrt` itself already throws, but TypeScript is unable to recognize it
                    // add a throw here to make the type inference correct.
                    throw RetryAbortError(err);
                }
                throw err;
            }
        },
        {
            base: 1000,
        },
    );
    ```

3. Through `AbortController`. This is useful when you need to abort in other place.
   Calling `contoller.abort` this in function arg is not recommended.

    ```ts
    const controller = new AbortController();
    retry(
        async ctx => {
            try {
                await placeOrder();
            } catch (err) {
                if (err.code === 500) {
                    throw ctx.abort(err);
                }
                throw err;
            }
        },
        {
            base: 1000,
            signal: controller.signal,
        },
    );

    // in other place (e.g. an interceptor), when something happens
    controller.abort('client hacked!!');
    ```

### `RetryAbortError.reason`

This prop represents the reason why this `RetryAbortError` is thrown

```ts
const retryPlaceOrder = retry.thunk(
    body => {
        try {
            await placeOrder(body);
        } catch (err) {
            if (err.code === 500) {
                // Notice: `ctx.aobrt` itself already throws, but TypeScript is unable to recognize it
                // add a throw here to make the type inference correct.
                throw RetryAbortError(err);
            }
            throw err;
        }
    },
    {
        base: 1000,
    },
);

retryPlaceOrder().catch(err => {
    if (err instanceof RetryAbortError) {
        if (err.reason) {
            console.log('abort retry due to', err.reason);
        }
    }
    throw err;
});
```

### `RetryAbortError.latest`

Say a function arg called once, got an error, then start retrying. If it's aborted,
the user of `retry` might still what to know the latest error instead of the `RetryAbortError`.

```ts
const retryPlaceOrder = retry.thunk(
    body => {
        try {
            await placeOrder(body);
        } catch (err) {
            if (err.code === 500) {
                // Notice: `ctx.aobrt` itself already throws, but TypeScript is unable to recognize it
                // add a throw here to make the type inference correct.
                throw RetryAbortError(err);
            }
            throw err;
        }
    },
    {
        base: 1000,
    },
);

retryPlaceOrder().catch(err => {
    if (err instanceof RetryAbortError) {
        if (err.reason) {
            console.log('abort retry due to', err.reason);
        }
        if (err.latest) {
            console.log('the latest retry is due to', err.latest);
        }
    }
});
```

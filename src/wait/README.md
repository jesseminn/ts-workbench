# `wait`

A simple `wait` function which can be aborted.

## Usage

```ts
const controller = new AbortController();

const run = async () => {
    await wait(3000, controller.signal).then(() => {
        // do simething
    });
};

// something happened, e.g. component unmount when waiting
// can also abort waiting
controller.abort();
```

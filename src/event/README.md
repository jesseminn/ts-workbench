## Why?

Nothing special, but notice the implementation of `emit`. Previously I ran into a pitfall when doing this:

```ts
const e = new EventEmitter();
e.addListener(() => {
    console.log('#1');
});
const callbackRunOnce = () => {
    console.log('#2');
    e.removeListener(callbackRunOnce);
};
e.addListener(callbackRunOnce);
e.addListener(() => {
    console.log('#3');
});
e.emit();
```

When the `e` emits, the second callback did not run. What happened exactly? Let's check the implementation of a common `EventEmitter`

```ts
class EventEmitter {
    private readonly callbacks: Callback[] = [];

    addListener(callback: Callback) {
        this.callbacks.push(callback);
    }

    removeListener(callback: Callback) {
        const index = this.callbacks.indexOf(callback);
        if (index === -1) return;
        this.callbacks.splice(index, 1);
    }

    emit() {
        // Implementation #1: old-fashioned for loop
        for (let i = 0; i < this.callbacks.length; i++) {
            const callback = this.callbacks[i];
            callback();
        }
        // Implementation #2: modern array method
        this.callbacks.forEach(callback => callback());
    }
}
```

The result of `Implementation #1`:

```
#1
#2
```

The result of `Implementation #2`:

```
#1
#2
```

When looping over the `callbacks` array, the second callback itself calls `removeListener` method to remove itself from the array, but the `index` of for-loop or `forEach` incremented from `1` to `2`, it'll targets to nothing because now the `callbacks` array only have 2 callbacks!

In general, modifying an array when looping over it is very likely to cause unexpected result. If you gonna do that, I think `while` loop is a safer choice because you have to control the `index` yourself.

```ts
emit() {
    let index = 0;
    while (index < this.callbacks.length) {
        const callback = this.callbacks[index];
        callback();
        // if the callback is still in the array, increment the index
        if (this.callbacks[index] === callback) {
            index++;
        }
    }
}
```

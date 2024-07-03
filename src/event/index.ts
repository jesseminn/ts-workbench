import { Signal } from '../signal';

type Callback = () => void;

type SubscribedCallback = {
    callback: Callback;
    once?: boolean;
};

export class EventEmitter {
    private readonly subscribedCallbacks: SubscribedCallback[] = [];

    emit() {
        let index = 0;
        while (index < this.subscribedCallbacks.length) {
            const { callback, once } = this.subscribedCallbacks[index];
            callback();
            if (once) {
                this.subscribedCallbacks.splice(index, 1);
            } else if (this.subscribedCallbacks[index].callback === callback) {
                // if the callback is still in the array, increment the index
                index++;
            } else {
                console.log('Prevent calling `off` in `on`. You can use `once` instead');
            }
        }
    }

    on(callback: Callback) {
        this.subscribedCallbacks.push({
            callback,
            once: false,
        });
    }

    once(callback: Callback) {
        this.subscribedCallbacks.push({
            callback,
            once: true,
        });
    }

    off(callback: Callback) {
        const index = this.subscribedCallbacks.findIndex(subscribedCallbacks => {
            return subscribedCallbacks.callback === callback;
        });
        if (index === -1) return;
        this.subscribedCallbacks.splice(index, 1);
    }
}

// another implementation
// added an `looping` lock
// when looping over callbacks, any add/delete to the callbacks array will happen on for loop ends
class E {
    private callbacks = new Map<Callback, boolean>();
    private looping$ = new Signal(false);

    private enqueue(callback: Callback, once?: boolean) {
        // if exists, movet the callback to the end of the map
        // https://stackoverflow.com/a/69951739
        if (this.callbacks.has(callback)) {
            this.callbacks.delete(callback);
        }
        this.callbacks.set(callback, once ?? false);
    }

    private dequeue(callback: Callback) {
        this.callbacks.delete(callback);
    }

    emit() {
        if (this.looping$.value()) return false;

        this.looping$.next(true);
        for (const callback of this.callbacks.keys()) {
            callback();
            const once = this.callbacks.get(callback);
            if (once) {
                this.off(callback);
            }
        }
        this.looping$.next(false);
    }

    on(callback: Callback, once?: boolean) {
        if (this.looping$.value()) {
            const unobserve = this.looping$.observe(looping => {
                if (!looping) {
                    this.enqueue(callback, once);
                    unobserve();
                }
            });
        } else {
            this.enqueue(callback, once);
        }

        return () => {
            this.off(callback);
        };
    }

    once(callback: Callback) {
        return this.on(callback, true);
    }

    off(callback: Callback) {
        if (this.looping$.value()) {
            const unobserve = this.looping$.observe(looping => {
                if (!looping) {
                    this.dequeue(callback);
                    unobserve();
                }
            });
        } else {
            this.dequeue(callback);
        }
    }
}

const map = new Map();
map.set('a', 1);
map.set('b', 2);

for (const k of map.keys()) {
    console.log(k);
    map.set(k.toUpperCase(), 99);
}
// logs a, b, A, B

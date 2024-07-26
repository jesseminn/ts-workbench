import { Signal } from '../signal';

type Callback<T> = (payload: T) => void;

// added an `looping` lock
// when looping over callbacks, any add/delete to the callbacks array
// will happen on loop ends
export class EventEmitter<T = void> {
    private callbacks = new Map<Callback<T>, boolean>();
    private looping$ = new Signal(false);

    private enqueue(callback: Callback<T>, once?: boolean) {
        // if exists, movet the callback to the end of the map
        // https://stackoverflow.com/a/69951739
        if (this.callbacks.has(callback)) {
            this.callbacks.delete(callback);
        }
        this.callbacks.set(callback, once ?? false);
    }

    private dequeue(callback: Callback<T>) {
        this.callbacks.delete(callback);
    }

    emit(payload: T) {
        if (this.looping$.value()) return false;

        this.looping$.next(true);
        for (const callback of this.callbacks.keys()) {
            callback(payload);
            const once = this.callbacks.get(callback);
            if (once) {
                this.removeListener(callback);
            }
        }
        this.looping$.next(false);
        return true;
    }

    addListener(callback: Callback<T>, once?: boolean) {
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
            this.removeListener(callback);
        };
    }

    addListenerOnce(callback: Callback<T>) {
        return this.addListener(callback, true);
    }

    removeListener(callback: Callback<T>) {
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

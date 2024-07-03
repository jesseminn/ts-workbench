export type Observer<V> = (value: V) => void;

export class Signal<V> {
    private observers = new Set<Observer<V>>();

    constructor(private v: V) {}

    value() {
        return this.v;
    }

    next(value: V) {
        this.v = value;
        this.observers.forEach(observer => observer(value));
    }

    observe(observer: Observer<V>) {
        observer(this.v);

        this.observers.add(observer);

        return () => {
            this.observers.delete(observer);
        };
    }
}

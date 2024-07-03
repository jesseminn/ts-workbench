import { Observer, Signal } from '../signal';

export class Cached<V, K = string> {
    private blocks = new Map<K, CachedBlock<V>>();

    constructor() {}

    has(key: K) {
        return this.blocks.has(key);
    }

    get(key: K) {
        const block = this.blocks.get(key);
        if (block) {
            return block.read();
        }
    }

    take(key: K) {
        const block = this.blocks.get(key);
        if (block) {
            const value = block.read();
            block.invalidate();
            return value;
        }
    }

    set(key: K, value: V, ttl?: number) {
        const block = this.blocks.get(key);
        if (block) {
            block.write(value);
        } else {
            const block = new CachedBlock(value, ttl);
            block.observe('invalidate', () => {
                this.blocks.delete(key);
            });
            this.blocks.set(key, block);
        }
    }

    delete(key: K) {
        const block = this.blocks.get(key);
        if (block) {
            block.invalidate();
            return true;
        } else {
            return false;
        }
    }

    clear() {
        this.blocks.forEach(block => {
            block.invalidate();
        });
    }

    watch(key: K, subscriber: Observer<V>) {
        const block = this.blocks.get(key);
        if (block) {
            return block.observe('dirty', () => {
                subscriber(block.read());
            });
        }
    }
}

/**
 * - Can set TTL when init.
 * - When TTL expired, block will invalidate itself.
 * - The block cannot delete itself, but the invalidation can be observed and delete the block by the cache.
 * - The block will mark itself as dirty when wrote a new value.
 * -
 */
class CachedBlock<V> {
    private valid$ = new Signal(true);
    private dirty$ = new Signal(false);
    private timeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private value: V,
        private ttl?: number,
    ) {
        if (ttl) {
            this.timeoutId = setTimeout(() => {
                this.invalidate();
            }, ttl);
        }
    }

    read() {
        this.dirty$.next(false);
        return this.value;
    }

    write(value: V) {
        if (value === this.value) return;

        this.dirty$.next(true);
        this.value = value;

        if (this.ttl) {
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
            }
            this.timeoutId = setTimeout(() => {
                this.invalidate();
            }, this.ttl);
        }
    }

    invalidate() {
        this.valid$.next(false);
    }

    isValid() {
        return this.valid$.value();
    }

    isDirty() {
        return this.dirty$.value();
    }

    observe(signal: 'dirty' | 'invalidate', observer: Observer<void>) {
        switch (signal) {
            case 'dirty':
                return this.dirty$.observe(dirty => {
                    if (dirty) {
                        observer();
                    }
                });
            case 'invalidate':
                return this.valid$.observe(valid => {
                    if (!valid) {
                        observer();
                    }
                });
        }
    }
}

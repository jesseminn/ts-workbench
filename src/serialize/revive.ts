import { isPOJO } from './utils';
import { $placeholder } from './tags';

/**
 * key: reference id
 * value: referenced object
 */
export type ReferenceMap = Map<number, unknown>;

export const revive = (x: object, map: ReferenceMap) => {
    if (x instanceof Map) {
        Array.from(x.entries()).forEach(([key, value]) => {
            let _k = key;
            if (typeof key === 'string' && $placeholder.validate(key)) {
                const id = $placeholder.parse(key);
                _k = map.get(id);
            }
            if (typeof key === 'object' && key !== null) {
                revive(key, map);
            }

            let _v = value;
            if (typeof value === 'string' && $placeholder.validate(value)) {
                const id = $placeholder.parse(value);
                _v = map.get(id);
            }
            if (typeof value === 'object' && value !== null) {
                revive(value, map);
            }
            x.delete(key);
            x.set(_k, _v);
        });
    }

    if (x instanceof Set) {
        Array.from(x).forEach(itr => {
            let _v = itr;
            x.delete(itr);
            if (typeof itr === 'string' && $placeholder.validate(itr)) {
                const id = $placeholder.parse(itr);
                _v = map.get(id);
            }
            if (typeof itr === 'object' && itr !== null) {
                revive(itr, map);
            }
            x.add(_v);
        });
    }

    if (Array.isArray(x)) {
        x.forEach((itr, i) => {
            if (typeof itr === 'string' && $placeholder.validate(itr)) {
                const id = $placeholder.parse(itr);
                x[i] = map.get(id);
            }
            if (typeof itr === 'object' && itr !== null) {
                revive(itr, map);
            }
        });
    }

    if (isPOJO(x)) {
        Reflect.ownKeys(x)
            .map(key => [key, (x as any)[key]])
            .forEach(([key, value]) => {
                if (typeof value === 'string' && $placeholder.validate(value)) {
                    const id = $placeholder.parse(value);
                    (x as any)[key] = map.get(id);
                }
                if (typeof value === 'object' && value !== null) {
                    revive(value, map);
                }
            });
    }
};

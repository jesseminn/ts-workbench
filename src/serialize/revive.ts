import { isPOJO } from './utils';
import { $reference } from './tags';

export const revive = (x: object, map: Map<string, object>) => {
    if (x instanceof Map) {
        Array.from(x.entries()).forEach(([key, value]) => {
            let _k = key;
            if (typeof key === 'string' && $reference.validate(key)) {
                const id = JSON.parse($reference.unwrap(key));
                _k = map.get(`${id}`);
            }
            if (typeof key === 'object' && key !== null) {
                revive(key, map);
            }

            let _v = value;
            if (typeof value === 'string' && $reference.validate(value)) {
                const id = JSON.parse($reference.unwrap(value));
                _v = map.get(`${id}`);
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
            if (typeof itr === 'string' && $reference.validate(itr)) {
                const id = JSON.parse($reference.unwrap(itr));
                _v = map.get(`${id}`);
            }
            if (typeof itr === 'object' && itr !== null) {
                revive(itr, map);
            }
            x.add(_v);
        });
    }

    if (Array.isArray(x)) {
        x.forEach((itr, i) => {
            if (typeof itr === 'string' && $reference.validate(itr)) {
                const id = JSON.parse($reference.unwrap(itr));
                x[i] = map.get(`${id}`);
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
                if (typeof value === 'string' && $reference.validate(value)) {
                    const id = JSON.parse($reference.unwrap(value));
                    (x as any)[key] = map.get(`${id}`);
                }
                if (typeof value === 'object' && value !== null) {
                    revive(value, map);
                }
            });
    }
};

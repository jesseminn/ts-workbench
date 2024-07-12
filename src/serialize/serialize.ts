import { isPOJO } from './utils';
import {
    $array,
    $bigint,
    $boolean,
    $date,
    $function,
    $infinity,
    $map,
    $nan,
    $negative_infinity,
    $negative_zero,
    $null,
    $number,
    $pojo,
    $placeholder,
    $regexp,
    $set,
    $string,
    $symbol,
    $undefined,
    $unsupported_object,
    $url,
} from './tags';

type Context = {
    /**
     * a map to map an object (reference type) to a reference id
     * the same object should always have the same reference id
     */
    map: WeakMap<object, number>;
    /**
     * the current count, increments when a new reference pair added to the map
     * used to generate reference id
     */
    count: number;
};

export function serialize(raw: unknown, _ctx?: Context): string {
    switch (typeof raw) {
        case 'string':
            return $string.create(raw);
        case 'number':
            if (isNaN(raw)) {
                return $nan.create();
            }
            if (Object.is(raw, Infinity)) {
                return $infinity.create();
            }
            if (Object.is(raw, -Infinity)) {
                return $negative_infinity.create();
            }
            // https://stackoverflow.com/a/7223395
            if (Object.is(raw, -0)) {
                return $negative_zero.create();
            }
            return $number.create(raw);
        case 'bigint':
            return $bigint.create(raw);
        case 'boolean':
            return $boolean.create(raw);
        case 'symbol':
            return $symbol.create(raw);
        case 'undefined':
            return $undefined.create();
        case 'object':
            if (raw === null) {
                return $null.create();
            }

            // init ctx
            const ctx = _ctx || { map: new WeakMap(), count: 0 };
            let id: number;
            if (ctx.map.has(raw)) {
                // if the object is already in the map, return the reference id as placeholder
                id = ctx.map.get(raw)!;
                return $placeholder.create(id);
            } else {
                // the object is not in the map, store the object and id pair
                ctx.count += 1;
                id = ctx.count;
                ctx.map.set(raw, id);
            }

            if (raw instanceof Map) {
                const entries = Array.from(raw.entries());
                const obj = entries
                    .map(([key, value]) => {
                        return [serialize(key, ctx), serialize(value, ctx)] as const;
                    })
                    .sort(([a], [b]) => {
                        return a.localeCompare(b);
                    })
                    .reduce<Record<string, string>>((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                    }, {});
                return $map.create(obj, id);
            }

            if (raw instanceof Set) {
                const array = Array.from(raw)
                    .map(itr => serialize(itr, ctx))
                    .sort((a, b) => {
                        return a.localeCompare(b);
                    });
                return $set.create(array, id);
            }

            if (Array.isArray(raw)) {
                return $array.create(
                    raw.map(itr => serialize(itr, ctx)),
                    id,
                );
            }

            if (raw instanceof Date) {
                return $date.create(raw.getTime(), id);
            }

            if (raw instanceof RegExp) {
                return $regexp.create(raw.source, id);
            }

            if (raw instanceof URL) {
                return $url.create(raw.toJSON(), id);
            }

            if (isPOJO(raw)) {
                // Object.keys ignored symbols
                // https://stackoverflow.com/questions/47372305/iterate-through-object-properties-with-symbol-keys
                const keys = Reflect.ownKeys(raw);
                // When the array contains symbol, if sort directly
                // will throw `Uncaught TypeError: Cannot convert a Symbol value to a string`
                keys.sort((a, b) => {
                    if (typeof a === 'symbol' && typeof b === 'symbol') {
                        return a.toString().localeCompare(b.toString());
                    }
                    if (typeof a === 'symbol') {
                        return -1;
                    }
                    if (typeof b === 'symbol') {
                        return 1;
                    }
                    // https://stackoverflow.com/a/51169
                    return a.localeCompare(b);
                });
                const obj = keys.reduce<Record<string | symbol, string>>((acc, key) => {
                    const value = raw[key as keyof typeof raw];
                    acc[serialize(key, ctx)] = serialize(value, ctx);
                    return acc;
                }, {});
                return $pojo.create(obj, id);
            }

            // Handle unsupported object
            let constructorName = '';
            const proto = Object.getPrototypeOf(raw);
            if (proto.hasOwnProperty('constructor')) {
                constructorName = proto.constructor.name;
            } else {
                constructorName = 'Unknown';
            }
            const display = `${constructorName} {}#${id}`;
            return $unsupported_object.create(display, id);
        case 'function': {
            // FIXME: dupliated code
            const ctx = _ctx || { map: new WeakMap(), count: 0 };
            let id: number;
            if (ctx.map.has(raw)) {
                // if the object is already in the map, return the reference id
                id = ctx.map.get(raw)!;
                return $placeholder.create(id);
            } else {
                // the object is not in the map, store the object and id pair
                ctx.count += 1;
                id = ctx.count;
                ctx.map.set(raw, id);
            }

            return $function.create(raw.toString(), id);
        }
    }
}

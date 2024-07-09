import { isPOJO } from './utils';
import { uid } from '../uid';
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
    $object,
    $placeholder,
    $regexp,
    $set,
    $string,
    $symbol,
    $undefined,
    $unsupported_object,
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
            return $string.wrap(JSON.stringify(raw));
        case 'number':
            if (isNaN(raw)) {
                return $nan.wrap();
            }
            if (Object.is(raw, Infinity)) {
                return $infinity.wrap();
            }
            if (Object.is(raw, -Infinity)) {
                return $negative_infinity.wrap();
            }
            // https://stackoverflow.com/a/7223395
            if (Object.is(raw, -0)) {
                return $negative_zero.wrap();
            }
            return $number.wrap(JSON.stringify(raw));
        case 'bigint':
            return $bigint.wrap(raw.toString());
        case 'boolean':
            return $boolean.wrap(JSON.stringify(raw));
        case 'symbol':
            return $symbol.wrap(JSON.stringify(raw.toString()));
        case 'undefined':
            return $undefined.wrap();
        case 'object':
            if (raw === null) {
                return $null.wrap();
            }

            // init ctx
            const ctx = _ctx || { map: new WeakMap(), count: 0 };
            let id: number;
            if (ctx.map.has(raw)) {
                // if the object is already in the map, return the reference id as placeholder
                id = ctx.map.get(raw)!;
                return $placeholder.wrap(JSON.stringify(id));
            } else {
                // the object is not in the map, store the object and id pair
                ctx.count += 1;
                id = ctx.count;
                ctx.map.set(raw, id);
            }

            if (raw instanceof Map) {
                const entries = Array.from(raw.entries());
                const obj = entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
                    acc[serialize(key, ctx)] = serialize(value, ctx);
                    return acc;
                }, {});
                return $map.wrap(JSON.stringify(serialize(obj, ctx)), id);
            }

            if (raw instanceof Set) {
                const array = Array.from(raw).sort((a, b) => {
                    return serialize(a, ctx).localeCompare(serialize(b, ctx));
                });
                return $set.wrap(JSON.stringify(serialize(array, ctx)), id);
            }

            if (Array.isArray(raw)) {
                return $array.wrap(JSON.stringify(raw.map(itr => serialize(itr, ctx))), id);
            }

            if (raw instanceof Date) {
                return $date.wrap(JSON.stringify(raw.getTime()), id);
            }

            if (raw instanceof RegExp) {
                return $regexp.wrap(JSON.stringify(raw.source), id);
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
                const obj = keys.reduce<Record<string | symbol, any>>((acc, key) => {
                    const value = raw[key as keyof typeof raw];
                    acc[serialize(key, ctx)] = serialize(value, ctx);
                    return acc;
                }, {});
                return $object.wrap(JSON.stringify(obj), id);
            }

            // Handle unsupported object
            let constructorName = '';
            const proto = Object.getPrototypeOf(raw);
            if (proto.hasOwnProperty('constructor')) {
                constructorName = proto.constructor.name;
            } else {
                constructorName = 'Unknown';
            }
            const placeholder = `${constructorName} {}#${uid(raw)}`;
            return $unsupported_object.wrap(JSON.stringify(placeholder), id);
        case 'function': {
            // FIXME: dupliated code
            const ctx = _ctx || { map: new WeakMap(), count: 0 };
            let id: number;
            if (ctx.map.has(raw)) {
                // if the object is already in the map, return the reference id
                id = ctx.map.get(raw)!;
                return $placeholder.wrap(JSON.stringify(id));
            } else {
                // the object is not in the map, store the object and id pair
                ctx.count += 1;
                id = ctx.count;
                ctx.map.set(raw, id);
            }

            return $function.wrap(raw.toString(), id);
        }
    }
}

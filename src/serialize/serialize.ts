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
    $reference,
    $regexp,
    $set,
    $string,
    $symbol,
    $undefined,
    $unsupported_object,
} from './tags';

export function serialize(raw: unknown, map?: WeakMap<object, number>, count = 0): string {
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

            // create an reference id for reference types
            // the same object should always have the same reference id
            // TODO: try simplify this part
            const _map = map || new WeakMap<object, number>();
            let _count: number;
            if (_map.has(raw)) {
                _count = _map.get(raw)!;
                return $reference.wrap(JSON.stringify(_count), `${_count}`);
            } else {
                _count = count + 1;
                _map.set(raw, _count);
            }

            if (raw instanceof Map) {
                const entries = Array.from(raw.entries());
                const obj = entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
                    acc[serialize(key, _map)] = serialize(value, _map, _count);
                    return acc;
                }, {});
                return $map.wrap(JSON.stringify(serialize(obj, _map, _count)), `${_count}`);
            }

            if (raw instanceof Set) {
                const array = Array.from(raw).sort((a, b) => {
                    return serialize(a, _map).localeCompare(serialize(b, _map, _count));
                });
                return $set.wrap(JSON.stringify(serialize(array, _map, _count)), `${_count}`);
            }

            if (Array.isArray(raw)) {
                return $array.wrap(JSON.stringify(raw.map(itr => serialize(itr, _map, _count))), `${_count}`);
            }

            if (raw instanceof Date) {
                return $date.wrap(JSON.stringify(raw.getTime()), `${_count}`);
            }

            if (raw instanceof RegExp) {
                return $regexp.wrap(JSON.stringify(raw.source), `${_count}`);
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
                    acc[serialize(key, _map, _count)] = serialize(value, _map, _count);
                    return acc;
                }, {});
                return $object.wrap(JSON.stringify(obj), `${_count}`);
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
            return $unsupported_object.wrap(JSON.stringify(placeholder), `${_count}`);
        case 'function':
            // TODO: ref like 'object' type
            return $function.wrap(raw.toString(), '');
    }
}

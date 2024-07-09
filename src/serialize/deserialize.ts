import { ID } from './utils';
import { revive } from './revive';
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

// can be memoized?
export function deserialize<T = unknown>(cooked: string, map?: Map<string, object>): T {
    // ----- primitive types ----- //
    if ($string.validate(cooked)) {
        const unwrapped = $string.unwrap(cooked);
        return JSON.parse(unwrapped);
    }

    if ($nan.validate(cooked)) {
        return NaN as T;
    }

    if ($infinity.validate(cooked)) {
        return Infinity as T;
    }

    if ($negative_infinity.validate(cooked)) {
        return -Infinity as T;
    }

    if ($negative_zero.validate(cooked)) {
        return -0 as T;
    }

    if ($number.validate(cooked)) {
        const str = $number.unwrap(cooked);
        return JSON.parse(str);
    }

    if ($bigint.validate(cooked)) {
        const str = $bigint.unwrap(cooked);
        return BigInt(Number(str)) as T;
    }

    if ($boolean.validate(cooked)) {
        const str = $boolean.unwrap(cooked);
        return JSON.parse(str) as T;
    }

    if ($symbol.validate(cooked)) {
        const str = $symbol.unwrap(cooked);
        // e.g. 'Symbol(foo)'
        const parsed = JSON.parse(str);
        const key = /^Symbol\((.*)\)$/.exec(parsed)?.[1];
        // try to get symbol from global symbol registry
        // if not found, create one
        return Symbol.for(key!) as T;
    }

    if ($undefined.validate(cooked)) {
        return undefined as T;
    }

    if ($null.validate(cooked)) {
        return null as T;
    }

    // ----- reference types ----- //

    // prepare reference id & reference map
    const _map = map || new Map<string, object>();
    const id = ID.parse(cooked);

    if ($date.validate(cooked)) {
        const unwrapped = $date.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        return new Date(parsed) as T;
    }

    if ($regexp.validate(cooked)) {
        const unwrapped = $regexp.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        return new RegExp(parsed) as T;
    }

    if ($map.validate(cooked)) {
        const unwrapped = $map.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        const object = deserialize<Record<string, string>>(parsed, _map);
        const entries = Object.entries(object).map(([key, value]) => {
            const _key = deserialize(key, _map);
            const _value = deserialize(value, _map);
            return [_key, _value] as const;
        });
        const result = new Map(entries) as object;
        _map.set(id, result);
        if (!map) {
            revive(result, _map);
        }
        return result as T;
    }

    if ($set.validate(cooked)) {
        const unwrapped = $set.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        const array = deserialize(parsed, _map) as unknown[];
        const result = new Set(array) as object;
        _map.set(id, result);
        if (!map) {
            revive(result, _map);
        }
        return result as T;
    }

    if ($array.validate(cooked)) {
        const unwrapped = $array.unwrap(cooked);
        const parsed = JSON.parse(unwrapped) as string[];
        const result = parsed.map(itr => deserialize(itr, _map)) as object;
        _map.set(id, result);
        if (!map) {
            revive(result, _map);
        }
        return result as T;
    }

    if ($object.validate(cooked)) {
        const unwrapped = $object.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        const result = Object.entries(parsed).reduce<Record<string, unknown>>((acc, [key, value]) => {
            const _key = deserialize<string>(key, _map);
            const _value = deserialize(value as any, _map);

            acc[_key] = _value;
            return acc;
        }, {}) as object;
        _map.set(id, result);
        if (!map) {
            revive(result, _map);
        }
        return result as T;
    }

    if ($unsupported_object.validate(cooked)) {
        const unwrapped = $unsupported_object.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        return parsed as T;
    }

    if ($function.validate(cooked)) {
        const str = $function.unwrap(cooked);
        // https://stackoverflow.com/a/28011280
        let f;
        eval(`f = function ${str}`);
        return f as T;
    }

    if ($reference.validate(cooked)) {
        // Just return the serialized string, will replace it with the real value
        // in `revive` process
        return cooked as T;
    }

    throw new Error(`Failed to deserialize: ${cooked}`);
}

import { ID } from './utils';
import { revive, ReferenceMap } from './revive';
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

// can be memoized?
export function deserialize<T = unknown>(cooked: string, _map?: ReferenceMap): T {
    // ----- primitive types ----- //
    if ($string.validate(cooked)) {
        return $string.parse(cooked) as T;
    }

    if ($nan.validate(cooked)) {
        return $nan.parse() as T;
    }

    if ($infinity.validate(cooked)) {
        return $infinity.parse() as T;
    }

    if ($negative_infinity.validate(cooked)) {
        return $negative_infinity.parse() as T;
    }

    if ($negative_zero.validate(cooked)) {
        return $negative_zero.parse() as T;
    }

    if ($number.validate(cooked)) {
        return $number.parse(cooked) as T;
    }

    if ($bigint.validate(cooked)) {
        return $bigint.parse(cooked) as T;
    }

    if ($boolean.validate(cooked)) {
        return $boolean.parse(cooked) as T;
    }

    if ($symbol.validate(cooked)) {
        return $symbol.parse(cooked) as T;
    }

    if ($undefined.validate(cooked)) {
        return $undefined.parse() as T;
    }

    if ($null.validate(cooked)) {
        return $null.parse() as T;
    }

    // ----- reference types ----- //

    // the very first call to `deserialize` won't have `_map` arg
    const initial = !_map;

    // prepare reference id & reference map
    const id = Number(ID.parse(cooked));
    const map: ReferenceMap = initial ? new Map<number, object>() : _map;

    if ($date.validate(cooked)) {
        const parsed = $date.parse(cooked);
        return new Date(parsed) as T;
    }

    if ($regexp.validate(cooked)) {
        const parsed = $regexp.parse(cooked);
        return new RegExp(parsed) as T;
    }

    if ($map.validate(cooked)) {
        const parsed = $map.parse(cooked);
        const entries = Object.entries(parsed).map(([key, value]) => {
            const _key = deserialize(key, map);
            const _value = deserialize(value, map);
            return [_key, _value] as const;
        });
        const result = new Map(entries);
        map.set(id, result);
        if (initial) {
            revive(result, map);
        }
        return result as T;
    }

    if ($set.validate(cooked)) {
        const parsed = $set.parse(cooked);
        const arr = parsed.map(itr => deserialize(itr, map));
        const result = new Set(arr);
        map.set(id, result);
        if (initial) {
            revive(result, map);
        }
        return result as T;
    }

    if ($array.validate(cooked)) {
        const parsed = $array.parse(cooked);
        const result = parsed.map(itr => deserialize(itr, map));
        map.set(id, result);
        if (initial) {
            revive(result, map);
        }
        return result as T;
    }

    if ($object.validate(cooked)) {
        const parsed = $object.parse(cooked);
        const result = Object.entries(parsed).reduce<Record<string, unknown>>((acc, [key, value]) => {
            const _key = deserialize<string>(key, map);
            const _value = deserialize(value as any, map);

            acc[_key] = _value;
            return acc;
        }, {}) as object;
        map.set(id, result);
        if (initial) {
            revive(result, map);
        }
        return result as T;
    }

    if ($unsupported_object.validate(cooked)) {
        const parsed = $unsupported_object.parse(cooked);
        map.set(id, parsed);
        return parsed as T;
    }

    if ($function.validate(cooked)) {
        const str = $function.parse(cooked);
        // https://stackoverflow.com/a/28011280
        let result: any;
        // FIXME: handle different types of function
        eval(`result = ${str}`);
        map.set(id, result);
        return result as T;
    }

    if ($placeholder.validate(cooked)) {
        // Just return the serialized string, will replace it with the real value
        // in `revive` process
        return cooked as T;
    }

    throw new Error(`Failed to deserialize: ${cooked}`);
}

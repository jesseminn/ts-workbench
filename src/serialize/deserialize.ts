import { ID } from './utils';
import { revive, ReferenceMap, ReferencePath } from './revive';
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
    $url,
} from './tags';

// can be memoized?
export function deserialize<T = unknown>(
    cooked: string,
    _map?: ReferenceMap,
    _path?: ReferencePath,
    _paths?: ReferencePath[],
): T {
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
    const map: ReferenceMap = _map || new Map<number, object>();
    const path = _path || [];
    const paths = _paths || [];

    // ----- reference types which won't be a tree ----- //

    if ($date.validate(cooked)) {
        const parsed = $date.parse(cooked);
        const date = new Date(parsed);
        map.set(id, date);
        return date as T;
    }

    if ($regexp.validate(cooked)) {
        const parsed = $regexp.parse(cooked);
        const regexp = new RegExp(parsed);
        map.set(id, regexp);
        return regexp as T;
    }

    if ($url.validate(cooked)) {
        const parsed = $url.parse(cooked);
        const url = new URL(parsed);
        map.set(id, url);
        return url as T;
    }

    if ($unsupported_object.validate(cooked)) {
        const parsed = $unsupported_object.parse(cooked);
        map.set(id, parsed);
        return parsed as T;
    }

    if ($placeholder.validate(cooked)) {
        // Just return the serialized string, will replace it with the real value
        // in `revive` process
        paths.push([...path, cooked]);
        return cooked as T;
    }

    if ($function.validate(cooked)) {
        const parsed = $function.parse(cooked);
        const name = /(?!function)(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)\(.*?\)/.exec(parsed)?.[1] || 'anonymous';

        // a workaround to mimic a closure
        function caller(ctx?: Record<string, unknown>) {
            let result: any;
            let functionString = '';

            const method_regex = /^(async\s+)?(?!function)((\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)\(.*?\)\s*\{[\S\s]*?\})$/;
            const matched = method_regex.exec(parsed);
            if (matched) {
                functionString = `${matched[1] || ''} function ${matched[2]}`;
            } else {
                functionString = parsed;
            }

            if (ctx) {
                // replace a *free variable* to a *bound variable* from `ctx`
                Object.keys(ctx).forEach(key => {
                    const regex = new RegExp(`(?<![ '"\`])\\b${key}\\b(?!['"\` ])`, 'g');
                    functionString = functionString.replace(regex, `ctx.${key}`);
                });
            }

            eval(`result = ${functionString}`);
            return result;
        }
        // change the name of the exposed function
        // https://stackoverflow.com/a/33067824
        Object.defineProperty(caller, 'name', { value: `${name}_caller` });
        map.set(id, caller);
        return caller as T;
    }

    // ----- reference types which could be a tree ----- //

    if ($map.validate(cooked)) {
        const parsed = $map.parse(cooked);
        const entries = Object.entries(parsed).map(([key, value]) => {
            const _key = deserialize(key, map, [...path, key], paths);
            const _value = deserialize(value, map, [...path, key], paths);
            return [_key, _value] as const;
        });
        const result = new Map(entries);
        map.set(id, result);
        if (initial) {
            revive(result, map, paths);
        }
        return result as T;
    }

    if ($set.validate(cooked)) {
        const parsed = $set.parse(cooked);
        const arr = parsed.map((itr, i) => deserialize(itr, map, [...path, i], paths));
        const result = new Set(arr);
        map.set(id, result);
        if (initial) {
            revive(result, map, paths);
        }
        return result as T;
    }

    if ($array.validate(cooked)) {
        const parsed = $array.parse(cooked);
        const result = parsed.map((itr, i) => deserialize(itr, map, [...path, i], paths));
        map.set(id, result);
        if (initial) {
            revive(result, map, paths);
        }
        return result as T;
    }

    if ($object.validate(cooked)) {
        const parsed = $object.parse(cooked);
        const result = Object.entries(parsed).reduce<Record<string, unknown>>((acc, [key, value]) => {
            const _key = deserialize<string>(key, map);
            const _value = deserialize(value as any, map, [...path, _key], paths);

            acc[_key] = _value;
            return acc;
        }, {}) as object;
        map.set(id, result);
        if (initial) {
            revive(result, map, paths);
        }
        return result as T;
    }

    throw new Error(`Failed to deserialize: ${cooked}`);
}

import { ID, POJO } from './utils';
import { PlaceholderMap, ReferenceMap, revive } from './revive';
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

// can be memoized?
export function deserialize<T = unknown>(
    cooked: string,
    _referenceMap?: ReferenceMap,
    _placeholderMap?: PlaceholderMap,
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

    // prepare reference id & reference map

    const id = Number(ID.parse(cooked));
    // the very first call to `deserialize` reference types won't have the map args
    const initial = !_referenceMap;
    const referenceMap: ReferenceMap = _referenceMap || new Map<number, object>();
    const placeholderMap = _placeholderMap || new Map<object, [string, string]>();

    // ----- reference types which won't be a tree ----- //

    if ($date.validate(cooked)) {
        const parsed = $date.parse(cooked);
        const date = new Date(parsed);
        referenceMap.set(id, date);
        return date as T;
    }

    if ($regexp.validate(cooked)) {
        const parsed = $regexp.parse(cooked);
        const regexp = new RegExp(parsed);
        referenceMap.set(id, regexp);
        return regexp as T;
    }

    if ($url.validate(cooked)) {
        const parsed = $url.parse(cooked);
        const url = new URL(parsed);
        referenceMap.set(id, url);
        return url as T;
    }

    if ($unsupported_object.validate(cooked)) {
        const parsed = $unsupported_object.parse(cooked);
        referenceMap.set(id, parsed);
        return parsed as T;
    }

    if ($placeholder.validate(cooked)) {
        // Just return the serialized string, will replace it with the real value
        // in `revive` process
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
        referenceMap.set(id, caller);
        return caller as T;
    }

    // ----- reference types which could be a tree ----- //

    if ($map.validate(cooked)) {
        const parsed = $map.parse(cooked);
        const result = new Map();
        Object.entries(parsed).forEach(([key, value]) => {
            const _key = deserialize(key, referenceMap, placeholderMap);
            const _value = deserialize(value, referenceMap, placeholderMap);
            // map's key & value both could be reference types
            if (
                (typeof _key === 'string' && $placeholder.validate(_key)) ||
                (typeof _value === 'string' && $placeholder.validate(_value))
            ) {
                placeholderMap.set(result, [_key, _value]);
            }
            result.set(_key, _value);
        });
        referenceMap.set(id, result);
        if (initial) {
            revive(referenceMap, placeholderMap);
        }
        return result as T;
    }

    if ($set.validate(cooked)) {
        const parsed = $set.parse(cooked);
        const result = new Set();
        parsed.forEach((itr, i) => {
            const _value = deserialize(itr, referenceMap, placeholderMap);
            if (typeof _value === 'string' && $placeholder.validate(_value)) {
                placeholderMap.set(result, [i, _value]);
            }
            result.add(_value);
        });
        referenceMap.set(id, result);
        if (initial) {
            revive(referenceMap, placeholderMap);
        }
        return result as T;
    }

    if ($array.validate(cooked)) {
        const parsed = $array.parse(cooked);
        const result = [] as Array<unknown>;
        parsed.forEach((itr, i) => {
            const _value = deserialize(itr, referenceMap, placeholderMap);
            if (typeof _value === 'string' && $placeholder.validate(_value)) {
                placeholderMap.set(result, [i, _value]);
            }
            result[i] = _value;
        });
        referenceMap.set(id, result);
        if (initial) {
            revive(referenceMap, placeholderMap);
        }
        return result as T;
    }

    if ($pojo.validate(cooked)) {
        const parsed = $pojo.parse(cooked);
        const result = {} as POJO;
        Object.entries(parsed).forEach(([key, value]) => {
            const _key = deserialize<string>(key, referenceMap);
            const _value = deserialize(value, referenceMap, placeholderMap);
            if (typeof _value === 'string' && $placeholder.validate(_value)) {
                placeholderMap.set(result, [_key, _value]);
            }
            result[_key] = _value;
        });
        referenceMap.set(id, result);
        if (initial) {
            revive(referenceMap, placeholderMap);
        }
        return result as T;
    }

    throw new Error(`Failed to deserialize: ${cooked}`);
}

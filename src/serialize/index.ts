/**
 * Ref:
 * https://github.com/yahoo/serialize-javascript
 * https://github.com/facebookexperimental/Recoil/blob/main/packages/shared/util/Recoil_stableStringify.js
 *
 * should not be confused with Node.js `v8.serialize`, which returns a `Buffer`
 *
 * JSON reserved chars https://stackoverflow.com/a/27516892
 * usually `JSON.stringify` handles this
 * will only occur if `JSON.parse` a string which is not produced by `JSON.stringify`
 */

const isIterable = (x: unknown): x is Iterable<unknown> => {
    return typeof (x as Iterable<unknown>)[Symbol.iterator] === 'function';
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
const isWithToJSON = (x: unknown): x is { toJSON: () => string } => {
    return typeof (x as { toJSON?: unknown }).toJSON === 'function';
};

// https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
const uid = () => {
    return Math.random().toString(16).slice(2, 10);
};

class $<T extends string | void> {
    private readonly start: string;
    private readonly end: string;
    constructor(readonly tag?: string) {
        this.start = typeof tag === 'string' && tag ? `${tag}__START__` : uid();
        this.end = typeof tag === 'string' && tag ? `${tag}__END__` : uid();
    }
    validate(v: string) {
        return v.startsWith(this.start) && v.endsWith(this.end);
    }
    wrap(v: T) {
        return `${this.start}${v || ''}${this.end}`;
    }
    unwrap(v: string) {
        return v.slice(this.start.length, v.length - this.end.length);
    }
}

// TODO: generate tag string dynamically in production
const $string = new $('__STRING__');
const $number = new $('__NUMBER__');
const $infinity = new $<void>('__INFITITY__');
const $negative_infinity = new $<void>('__NEGATIVE_INFITITY__');
const $negative_zero = new $<void>('__NEGATIVE_ZERO__');
const $nan = new $<void>('__NAN__');
const $bigint = new $('__BIGINT__');
const $boolean = new $('__BOOLEAN__');
const $symbol = new $('__SYMBOL__');
const $undefined = new $<void>('__UNDEFINED__');
const $null = new $<void>('__NULL__');
const $array = new $('__ARRAY__');
const $map = new $('__MAP__');
const $set = new $('__SET__');
const $object = new $('__OBJECT__');
const $promise = new $('__PROMISE__');
const $iterable = new $('__ITERABLE__');
const $function = new $('__FUNCTION__');
const $date = new $('__DATE__');

export function serialize(raw: unknown): string {
    // type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
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
            if (raw instanceof Map) {
                const entries = Array.from(raw.entries());
                return $map.wrap(JSON.stringify(entries.map(entry => serialize(entry))));
            }
            if (raw instanceof Set) {
                return $set.wrap(JSON.stringify(Array.from(raw).map(itr => serialize(itr))));
            }
            if (Array.isArray(raw)) {
                return $array.wrap(JSON.stringify(raw.map(itr => serialize(itr))));
            }
            if (raw instanceof Date) {
                return $date.wrap(JSON.stringify(raw.getTime()));
            }
            if (raw instanceof Promise) {
                // cannot revive promise?
                return $promise.wrap('');
            }
            if (isIterable(raw)) {
                // cannot revive iterable?
                return $iterable.wrap('');
            }
            // FIXME: support toJSON?
            // if (isWithToJSON(input)) {
            //     return $object.wrap(JSON.stringify(input));
            // }

            return $object.wrap(
                JSON.stringify(
                    // Object.keys ignored symbols
                    // https://stackoverflow.com/questions/47372305/iterate-through-object-properties-with-symbol-keys
                    Reflect.ownKeys(raw)
                        // When the array contains symbol, if sort directly
                        // will throw `Uncaught TypeError: Cannot convert a Symbol value to a string`
                        .sort((a, b) => {
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
                        })
                        .reduce<Record<string | symbol, any>>((acc, key) => {
                            const value = raw[key as keyof typeof raw];
                            acc[serialize(key)] = serialize(value);
                            return acc;
                        }, {}),
                ),
            );
        case 'function':
            return $function.wrap(raw.toString());
    }
}

// can be memoized?
export function deserialize<T>(cooked: string): T {
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

    if ($date.validate(cooked)) {
        const unwrapped = $date.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        return new Date(parsed) as T;
    }

    if ($map.validate(cooked)) {
        const unwrapped = $map.unwrap(cooked);
        const parsed = JSON.parse(unwrapped) as string[];
        const entries = parsed.map(itr => deserialize(itr) as [unknown, unknown]);
        return new Map(entries) as T;
    }

    if ($set.validate(cooked)) {
        const unwrapped = $set.unwrap(cooked);
        const parsed = JSON.parse(unwrapped) as string[];
        const items = parsed.map(itr => deserialize(itr));
        return new Set(items) as T;
    }

    if ($array.validate(cooked)) {
        const unwrapped = $array.unwrap(cooked);
        const parsed = JSON.parse(unwrapped) as string[];
        return parsed.map(itr => deserialize(itr)) as T;
    }

    if ($object.validate(cooked)) {
        const unwrapped = $object.unwrap(cooked);
        const parsed = JSON.parse(unwrapped);
        return Object.entries(parsed).reduce<Record<string, unknown>>((acc, [key, value]) => {
            acc[deserialize<string>(key)] = deserialize(value as any);
            return acc;
        }, {}) as T;
    }

    if ($function.validate(cooked)) {
        const str = $function.unwrap(cooked);
        // https://stackoverflow.com/a/28011280
        let f;
        eval(`f = function ${str}`);
        return f as T;
    }

    return null as T;
}

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

// https://adamcoster.com/blog/pojo-detector
const isPOJO = (x: unknown): x is object => {
    return x !== null && typeof x === 'object' && [null, Object.prototype].includes(Object.getPrototypeOf(x));
};

// https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
const cache = new WeakMap<object, string>();
const uid = (seed?: object) => {
    if (seed && cache.has(seed)) {
        return cache.get(seed)!;
    }

    const result = Math.random().toString(16).slice(2, 10);

    if (seed) {
        cache.set(seed, result);
    }

    return result;
};

// An util object
const ID = {
    match(v: string) {
        const regex = /^##(.+?)##/;
        return regex.exec(v);
    },
    bind(id: string, v: string) {
        // TODO: randomize wrappers in production
        const start = '##';
        const end = '##';
        return `${start}${id}${end}${v}`;
    },
    strip(v: string) {
        const result = this.match(v);
        if (!result) {
            return v;
        } else {
            const matched = result[0];
            return v.slice(matched.length);
        }
    },
    parse(v: string) {
        const result = this.match(v);
        if (!result) {
            return '';
        } else {
            const matched = result[1];
            return matched;
        }
    },
};

class BaseTag {
    protected readonly start: string;
    protected readonly end: string;
    constructor(tag?: string) {
        this.start = typeof tag === 'string' && tag ? `${tag}__START__` : uid();
        this.end = typeof tag === 'string' && tag ? `${tag}__END__` : uid();
    }
}

class PrimitiveTag extends BaseTag {
    constructor(tag?: string) {
        super(tag);
    }
    validate(v: string) {
        return v.startsWith(this.start) && v.endsWith(this.end);
    }
    wrap(v: string) {
        return `${this.start}${v}${this.end}`;
    }
    unwrap(v: string) {
        return v.slice(this.start.length, v.length - this.end.length);
    }
}

class SingletonPrimitiveTag extends BaseTag {
    constructor(tag?: string) {
        super(tag);
    }
    validate(v: string) {
        return v.startsWith(this.start) && v.endsWith(this.end);
    }
    wrap() {
        return `${this.start}${this.end}`;
    }
    unwrap(v: string) {
        return v.slice(this.start.length, v.length - this.end.length);
    }
}

class ReferenceTag extends BaseTag {
    constructor(readonly tag: string) {
        super(tag);
    }
    validate(v: string) {
        const stripped = ID.strip(v);
        return stripped.startsWith(this.start) && stripped.endsWith(this.end);
    }
    wrap(v: string, id: string) {
        return ID.bind(id, `${this.start}${v}${this.end}`);
    }
    unwrap(v: string) {
        const stripped = ID.strip(v);
        return stripped.slice(this.start.length, stripped.length - this.end.length);
    }
}

// TODO: generate tag string dynamically in production
const $string = new PrimitiveTag('__STRING__');
const $number = new PrimitiveTag('__NUMBER__');
const $infinity = new SingletonPrimitiveTag('__INFITITY__');
const $negative_infinity = new SingletonPrimitiveTag('__NEGATIVE_INFITITY__');
const $negative_zero = new SingletonPrimitiveTag('__NEGATIVE_ZERO__');
const $nan = new SingletonPrimitiveTag('__NAN__');
const $bigint = new PrimitiveTag('__BIGINT__');
const $boolean = new PrimitiveTag('__BOOLEAN__');
const $symbol = new PrimitiveTag('__SYMBOL__');
const $undefined = new SingletonPrimitiveTag('__UNDEFINED__');
const $null = new SingletonPrimitiveTag('__NULL__');
const $array = new ReferenceTag('__ARRAY__');
const $map = new ReferenceTag('__MAP__');
const $set = new ReferenceTag('__SET__');
const $object = new ReferenceTag('__OBJECT__');
const $unsupported_object = new ReferenceTag('__UNSUPPORTED_OBJECT__');
const $function = new ReferenceTag('__FUNCTION__');
const $date = new ReferenceTag('__DATE__');
const $regexp = new ReferenceTag('__REGEXP__');
const $reference = new ReferenceTag('__REFERENCE__');

export function serialize(raw: unknown, map?: WeakMap<object, string>): string {
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

            // create an reference id for reference types
            // the same object should always have the same reference id
            // TODO: try simplify this part
            const _map = map || new WeakMap<object, string>();
            let id = '';
            if (_map.has(raw)) {
                id = _map.get(raw)!;
                return $reference.wrap(JSON.stringify(id), id);
            } else {
                id = uid();
                _map.set(raw, id);
            }

            if (raw instanceof Map) {
                const entries = Array.from(raw.entries());
                const obj = entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
                    acc[serialize(key, _map)] = serialize(value, _map);
                    return acc;
                }, {});
                return $map.wrap(JSON.stringify(serialize(obj, _map)), id);
            }

            if (raw instanceof Set) {
                const array = Array.from(raw).sort((a, b) => {
                    return serialize(a, _map).localeCompare(serialize(b, _map));
                });
                return $set.wrap(JSON.stringify(serialize(array, _map)), id);
            }

            if (Array.isArray(raw)) {
                return $array.wrap(JSON.stringify(raw.map(itr => serialize(itr, _map))), id);
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
                    acc[serialize(key, _map)] = serialize(value, _map);
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
        case 'function':
            // TODO: ref like 'object' type
            return $function.wrap(raw.toString(), '');
    }
}

// can be memoized?
export function deserialize<T>(cooked: string, map?: Map<string, object>): T {
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

    // ----- compound types ----- //

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
            const _key = deserialize<string>(key, map);
            const _value = deserialize(value as any, map);

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

const revive = (x: object, map: Map<string, any>) => {
    if (x instanceof Map) {
        Array.from(x.entries()).forEach(([key, value]) => {
            let _k = key;
            if (typeof key === 'string' && $reference.validate(key)) {
                const id = JSON.parse($reference.unwrap(key));
                _k = map.get(id);
            }
            if (typeof key === 'object' && key !== null) {
                revive(key, map);
            }

            let _v = value;
            if (typeof value === 'string' && $reference.validate(value)) {
                const id = JSON.parse($reference.unwrap(value));
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
            if (typeof itr === 'string' && $reference.validate(itr)) {
                const id = JSON.parse($reference.unwrap(itr));
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
            if (typeof itr === 'string' && $reference.validate(itr)) {
                const id = JSON.parse($reference.unwrap(itr));
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
                if (typeof value === 'string' && $reference.validate(value)) {
                    const id = JSON.parse($reference.unwrap(value));
                    (x as any)[key] = map.get(id);
                }
                if (typeof value === 'object' && value !== null) {
                    revive(value, map);
                }
            });
    }
};

/*
const obj: Record<string, any> = { foo: 42 };
obj.bar = obj;
// obj.baz = [obj];
const s = serialize(obj);
console.log(s);
const d = deserialize(s);
console.log(d);
*/

/*
const date = new Date();
const obj = {
    a: date,
    b: date,
};
const s = serialize(date);
console.log(s);
const p = deserialize(s);
console.log(p);
console.log(obj.a === obj.b);
*/

/* test map circular ref
const map = new Map();
// map.set('bar', map);
map.set(map, 42);
const s = serialize(map);
// console.log(s);
const d = deserialize(s);
console.log(d);
// console.log(d);
*/

/*
const arr: Array<any> = [1];
arr[1] = arr;
const s = serialize(arr);
console.log(s);
const d = deserialize(s);
console.log(d);
*/

/*
const set = new Set();
set.add(set);
const s = serialize(set);
console.log(s);
const d = deserialize(s);
console.log(d);
*/

const obj: Record<any, any> = {};
obj.foo = obj;
const set = new Set();
set.add(set);
obj.set = set;
class F {}
const f = new F();
obj.f = f;

const s = serialize(obj);
const d = deserialize(s);
console.log(d);

import { ID, POJO } from './utils';
import { uid } from '../uid';

const debug = true;

class BaseTag {
    protected readonly start: string;
    protected readonly end: string;
    constructor(tag: string) {
        this.start = debug ? `${tag}__START__` : uid();
        this.end = debug ? `${tag}__END__` : uid();
    }
    validate(v: string) {
        return v.startsWith(this.start) && v.endsWith(this.end);
    }
    protected wrap(str: string) {
        return `${this.start}${str}${this.end}`;
    }
    protected unwrap(str: string) {
        return str.slice(this.start.length, str.length - this.end.length);
    }
}

class PrimitiveTag<T = unknown> extends BaseTag {
    constructor(tag: string) {
        super(tag);
    }
    create(v: T) {
        const stringified = JSON.stringify(v);
        return this.wrap(stringified);
    }
    parse(v: string) {
        const unwrapped = this.unwrap(v);
        return JSON.parse(unwrapped) as T;
    }
}

class BigIntTag extends PrimitiveTag<number | bigint> {
    constructor(tag: string) {
        super(tag);
    }
    create(v: bigint) {
        // e.g. 99n -> '99' -> 99
        const num = Number(v.toString());
        return super.create(num);
    }
    parse(v: string) {
        const parsed = super.parse(v);
        return BigInt(parsed);
    }
}

class SymbolTag extends PrimitiveTag<string | symbol> {
    constructor(tag: string) {
        super(tag);
    }
    create(v: symbol) {
        // e.g. Symbol('foo') -> 'Symbol(foo)'
        const str = v.toString();
        return super.create(str);
    }
    parse(v: string) {
        const parsed = String(super.parse(v));
        // e.g. get 'foo' from 'Symbol(foo)'
        const key = /^Symbol\((.*)\)$/.exec(parsed)?.[1]!;
        return Symbol.for(key);
    }
}

class SingletonPrimitiveTag<T> extends PrimitiveTag<void> {
    constructor(
        tag: string,
        private readonly value: T,
    ) {
        super(tag);
    }
    create() {
        return `${this.start}${this.end}`;
    }
    parse() {
        return this.value;
    }
}

class PlaceholderTag extends PrimitiveTag<number> {
    constructor(tag: string) {
        super(tag);
    }
}

// `T` represents the middle type which will be serialized and parsed
class ReferenceTag<T> extends BaseTag {
    constructor(readonly tag: string) {
        super(tag);
    }
    validate(v: string) {
        const stripped = ID.strip(v);
        return super.validate(stripped);
    }
    create(v: T, id: number) {
        const stringified = JSON.stringify(v);
        const wrapped = this.wrap(stringified);
        return ID.bind(id, wrapped);
    }
    parse(v: string) {
        const stripped = ID.strip(v);
        const unwrapped = this.unwrap(stripped);
        return JSON.parse(unwrapped) as T;
    }
}

export const $string = new PrimitiveTag<string>('__STRING__');
export const $number = new PrimitiveTag<number>('__NUMBER__');
export const $infinity = new SingletonPrimitiveTag('__INFITITY__', Infinity);
export const $negative_infinity = new SingletonPrimitiveTag('__NEGATIVE_INFITITY__', -Infinity);
export const $negative_zero = new SingletonPrimitiveTag('__NEGATIVE_ZERO__', -0);
export const $nan = new SingletonPrimitiveTag('__NAN__', NaN);
export const $bigint = new BigIntTag('__BIGINT__');
export const $boolean = new PrimitiveTag<boolean>('__BOOLEAN__');
export const $symbol = new SymbolTag('__SYMBOL__');
export const $undefined = new SingletonPrimitiveTag('__UNDEFINED__', undefined);
export const $null = new SingletonPrimitiveTag('__NULL__', null);
export const $array = new ReferenceTag<Array<string>>('__ARRAY__');
export const $map = new ReferenceTag<Record<string, string>>('__MAP__');
export const $set = new ReferenceTag<Array<string>>('__SET__');
export const $pojo = new ReferenceTag<POJO<string>>('__POJO__');
export const $unsupported_object = new ReferenceTag('__UNSUPPORTED_OBJECT__');
export const $function = new ReferenceTag<string>('__FUNCTION__');
export const $date = new ReferenceTag<number>('__DATE__');
export const $regexp = new ReferenceTag<string>('__REGEXP__');
export const $url = new ReferenceTag<string>('__URL__');
export const $placeholder = new PlaceholderTag('__PLACEHOLDER__');

import { ID } from './utils';
import { uid } from '../uid';

// TODO
// `wrap` method should have JSON.stringify
// rename `wrap` to `stringify`
// `unwrap` method should have JSON.parse
// rename `unwrap` to `parse`

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

class SingletonPrimitiveTag extends PrimitiveTag {
    constructor(tag?: string) {
        super(tag);
    }
    wrap() {
        return `${this.start}${this.end}`;
    }
}

class PlaceholderTag extends PrimitiveTag {
    constructor(tag?: string) {
        super(tag);
    }
}

class ReferenceTag extends BaseTag {
    constructor(readonly tag?: string) {
        super(tag);
    }
    validate(v: string) {
        const stripped = ID.strip(v);
        return stripped.startsWith(this.start) && stripped.endsWith(this.end);
    }
    wrap(v: string, id: number) {
        return ID.bind(id, `${this.start}${v}${this.end}`);
    }
    unwrap(v: string) {
        const stripped = ID.strip(v);
        return stripped.slice(this.start.length, stripped.length - this.end.length);
    }
}

// TODO: generate tag string dynamically in production
export const $string = new PrimitiveTag('__STRING__');
export const $number = new PrimitiveTag('__NUMBER__');
export const $infinity = new SingletonPrimitiveTag('__INFITITY__');
export const $negative_infinity = new SingletonPrimitiveTag('__NEGATIVE_INFITITY__');
export const $negative_zero = new SingletonPrimitiveTag('__NEGATIVE_ZERO__');
export const $nan = new SingletonPrimitiveTag('__NAN__');
export const $bigint = new PrimitiveTag('__BIGINT__');
export const $boolean = new PrimitiveTag('__BOOLEAN__');
export const $symbol = new PrimitiveTag('__SYMBOL__');
export const $undefined = new SingletonPrimitiveTag('__UNDEFINED__');
export const $null = new SingletonPrimitiveTag('__NULL__');
export const $array = new ReferenceTag('__ARRAY__');
export const $map = new ReferenceTag('__MAP__');
export const $set = new ReferenceTag('__SET__');
export const $object = new ReferenceTag('__OBJECT__');
export const $unsupported_object = new ReferenceTag('__UNSUPPORTED_OBJECT__');
export const $function = new ReferenceTag('__FUNCTION__');
export const $date = new ReferenceTag('__DATE__');
export const $regexp = new ReferenceTag('__REGEXP__');
export const $placeholder = new PlaceholderTag('__PLACEHOLDER__');

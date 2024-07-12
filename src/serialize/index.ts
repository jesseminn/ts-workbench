import { serialize as _serialize } from './serialize';
import { deserialize as _deserialize } from './deserialize';

// Just expose the first arg
export function serialize(raw: unknown) {
    return _serialize(raw);
}

// Just expose the first arg
export function deserialize<T = unknown>(cooked: string): T {
    return _deserialize(cooked);
}

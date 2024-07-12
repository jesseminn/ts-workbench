import { isPOJO, ObjectKey, POJO } from './utils';
import { $placeholder } from './tags';

/**
 * key: reference id
 *
 * value: referenced object
 */
export type ReferenceMap = Map<number, unknown>;

/**
 * key: parent object
 *
 * value: key-value pair tuple.
 *
 * possible types
 *
 * - when the parent is a `Map`, both key and value could be placeholders
 * - when the parent is a `Set`, key is `number` (but useless) and value is placeholder
 * - when the parent is a `Set`, key is `number` (but useless) and value is placeholder
 * - when the parent is an `Array`, key is `number` and value is placeholder
 * - when the parent is n `POJO`, key is `string | symbol` and value is placeholder
 *
 */
export type PlaceholderMap = Map<object, [unknown, unknown]>;

export type ReviveContext = {
    readonly referenceMap: ReferenceMap;
    readonly placeholderMap: PlaceholderMap;
};

export const revive = ({ referenceMap, placeholderMap }: ReviveContext) => {
    const entries = Array.from(placeholderMap.entries());
    entries.forEach(([obj, [key, value]]) => {
        if (obj instanceof Map) {
            let _key = key;
            let _value = value;
            if (typeof key === 'string' && $placeholder.validate(key)) {
                const id = $placeholder.parse(key);
                _key = referenceMap.get(id);
                obj.delete(key);
            }
            if (typeof value === 'string' && $placeholder.validate(value)) {
                const id = $placeholder.parse(value);
                _value = referenceMap.get(id);
            }
            obj.set(_key, _value);
        }
        if (obj instanceof Set) {
            if (typeof value === 'string' && $placeholder.validate(value)) {
                const id = $placeholder.parse(value);
                const ref = referenceMap.get(id);
                obj.delete(value);
                obj.add(ref);
            }
        }
        if (Array.isArray(obj)) {
            if (typeof value === 'string' && $placeholder.validate(value)) {
                const id = $placeholder.parse(value);
                const ref = referenceMap.get(id);
                obj[key as number] = ref;
            }
        }
        if (isPOJO(obj)) {
            if (typeof value === 'string' && $placeholder.validate(value)) {
                const id = $placeholder.parse(value);
                const ref = referenceMap.get(id);
                obj[key as ObjectKey] = ref;
            }
        }
    });
    referenceMap.clear();
    placeholderMap.clear();
};

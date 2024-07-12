import { isPOJO, ObjectKey } from './utils';
import { $placeholder } from './tags';

/**
 * key: reference id
 * value: referenced object
 */
export type ReferenceMap = Map<number, unknown>;

/**
 * key: parent object
 * value: key-placeholder pair
 */
export type PlaceholderMap = Map<object, [unknown, unknown]>;

export const revive = (referenceMap: ReferenceMap, placeholderMap: PlaceholderMap) => {
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

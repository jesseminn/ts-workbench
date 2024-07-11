import { isPOJO } from './utils';
import { $placeholder } from './tags';

/**
 * key: reference id
 * value: referenced object
 */
export type ReferenceMap = Map<number, unknown>;

/**
 * Will be a path to the reference placeholder. For example
 * ```ts
 * ['a', 'b', 0, '__PLACEHOLDER_START__##1##__PLACEHOLDER_END__']
 * ````
 * The path should be prepared in `deserialize` process.
 */
export type ReferencePath = Array<unknown>;

/**
 * revive v2: only go through paths to placeholders
 */
export const revive = (x: object, map: ReferenceMap, paths: ReferencePath[]) => {
    paths.forEach(path => {
        let current = x;
        path.forEach((p, i, thisArr) => {
            if (i === thisArr.length - 1) {
                const id = $placeholder.parse(p as string);
                const key = thisArr[i - 1];
                const ref = map.get(id);
                if (current instanceof Map) {
                    current.set(key, ref);
                }
                if (current instanceof Set) {
                    current.delete(p);
                    current.add(ref);
                }
                if (Array.isArray(current)) {
                    current[key as number] = ref;
                }
                if (isPOJO(current)) {
                    current[key as string] = ref;
                }
            }

            if (i < thisArr.length - 2) {
                if (current instanceof Map) {
                    current = current.get(p);
                }
                if (current instanceof Set) {
                    current = p as any;
                }
                if (Array.isArray(current)) {
                    current = current[p as number];
                }
                if (isPOJO(current)) {
                    current = current[p as string] as any;
                }
            }
        });
    });
};

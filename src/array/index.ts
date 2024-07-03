import { Equal } from '../types';

export const sortArrayByArray = <T, U>(arr1: T[], arr2: U[], selector?: (v: T) => U): T[] => {
    const _selector = typeof selector === 'function' ? selector : (v: T) => v;

    return [...arr1].sort((a, b) => {
        // how to prevent using `as` to silence the warning?
        const x = arr2.indexOf(_selector(a) as U);
        const y = arr2.indexOf(_selector(b) as U);
        return x - y;
    });
};

export const shallowCompareArrays = (arr1: any, arr2: any) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;

    if (arr1.length !== arr2.length) return false;

    return !arr1.some((item, i) => {
        return arr2[i] !== item;
    });
};

export const uniqueArray = <T>(arr: T[], equal?: Equal<T>) => {
    if (typeof equal !== 'function') {
        return Array.from(new Set([...arr]));
    } else {
        const newArr: T[] = [];
        arr.forEach(a => {
            const found = newArr.find(b => equal(a, b));
            if (!found) {
                newArr.push(a);
            }
        });
        return newArr;
    }
};

// Order does not matter, `[1, 2, 3]` is consider same as `[2, 3, 1]`
export const compareArrays = <T>(arr1: T[], arr2: T[], equal: Equal<T> = (a, b) => a === b) => {
    return (
        Array.isArray(arr1) &&
        Array.isArray(arr2) &&
        arr1.length === arr2.length &&
        !arr1.some(a1 => !arr2.find(a2 => equal(a1, a2)))
    );
};

// Order matters.
export const equalArray = <T>(
    arr1: T[] | null | undefined,
    arr2: T[] | null | undefined,
    equal: Equal<T> = (a, b) => a === b,
) => {
    if (!(Array.isArray(arr1) && Array.isArray(arr2))) {
        // If not both are arrays, considered as unequal
        return false;
    } else if (arr1.length !== arr2.length) {
        return false;
    } else {
        for (let i = 0; i < arr1.length; i++) {
            if (equal(arr1[i], arr2[i])) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    }
};

// the left array are items in arr1 but not in arr2
// the right array are item in arr2 but not in arr1
export const arraySymmetricDifference = <T>(arr1: T[], arr2: T[], equal: Equal<T> = (a, b) => a === b) => {
    if (compareArrays(arr1, arr2, equal)) {
        return [[], []];
    }

    const leftArr: T[] = [...arr1];
    let rightArr: T[] = [];

    arr2.forEach(d => {
        const foundItemIndex = leftArr.findIndex(item => equal(item, d));
        if (foundItemIndex >= 0) {
            leftArr.splice(foundItemIndex, 1);
        } else {
            rightArr = [...rightArr, d];
        }
    });

    return [leftArr, rightArr];
};

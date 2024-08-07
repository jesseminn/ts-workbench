import { serialize, deserialize } from '.';

describe('serialize', () => {
    it('should sort keys of an object', () => {
        const x = { a: 1, b: 2 };
        const y = { b: 2, a: 1 };
        const _x = serialize(x);
        const _y = serialize(y);
        expect(_x).toEqual(_y);
    });

    it('should sort keys of a map', () => {
        const x = new Map<string, number>([
            ['a', 1],
            ['b', 2],
        ]);
        const y = new Map<string, number>([
            ['b', 2],
            ['a', 1],
        ]);
        const _x = serialize(x);
        const _y = serialize(y);
        expect(_x).toEqual(_y);
    });

    it('should sort items of a set', () => {
        const x = new Set<string>();
        x.add('a');
        x.add('b');
        const y = new Set<string>();
        y.add('b');
        y.add('a');
        const _x = serialize(x);
        const _y = serialize(y);
        expect(_x).toEqual(_y);
    });

    it('should serialize and deserilize a map', () => {
        const map = new Map();
        map.set('foo', 42);
        map.set('bar', { baz: 66 });
        map.set({ yee: true }, [123]);
        const s = serialize(map);
        const d = deserialize(s);
        expect(d).toBeInstanceOf(Map);
    });

    it('should handle circular references of a POJO', () => {
        const obj: Record<string, any> = { foo: 'bar' };
        obj.self = obj;
        const s = serialize(obj);
        const d = deserialize<typeof obj>(s);
        expect(d).toStrictEqual(d.self);
    });

    it('should handle circular references of a map', () => {
        const map = new Map();
        map.set(map, 42);
        const s = serialize(map);
        const d = deserialize<Map<any, any>>(s);
        const keys = Array.from(d.keys());
        expect(keys[0]).toStrictEqual(d);
    });

    it('should handle circular references of a set', () => {
        const set = new Set();
        set.add(set);
        const s = serialize(set);
        const d = deserialize<Set<any>>(s);
        const values = Array.from(d.values());
        expect(values[0]).toStrictEqual(d);
    });

    it('should serialize and deserialize a complex object', () => {
        const map = new Map();
        map.set('foo', 42);
        map.set('bar', { baz: 66 });
        map.set({ yee: true }, [123]);

        const set = new Set();
        set.add('foo');

        class Unsupported {}
        const unsupported = new Unsupported();

        const circular: Record<string, any> = { foo: 42 };
        circular.self = circular;

        const obj = {
            // primitive types
            str: 'foo',
            num: 42,
            nan: NaN,
            bigint: 99n,
            boolean: false,
            negInf: -Infinity,
            null: null,
            undefined: undefined,
            [Symbol('foo')]: Symbol('bar'),
            unsupported: [unsupported, unsupported],

            // refenence types
            arr: [1, { foo: 'bar' }],
            set: set,
            map: map,
            obj: {
                bar: 44,
            },
            method(x: number) {
                console.log('call fn', x);
            },
        };
        const s = serialize(obj);
        const d = deserialize<typeof obj>(s);
        console.log(d);
        expect(d).toBeTruthy();
    });

    it('should revive reference in a set', () => {
        const obj = {};
        const set = new Set<any>();
        set.add(obj);
        set.add(42);
        const s = serialize(set);
        const d = deserialize(s);
        console.log(d);
        expect(d).toBeTruthy();
    });

    it('should handle date reference', () => {
        const date = new Date();
        const arr = [date, 42, date];
        const s = serialize(arr);
        const d = deserialize<any[]>(s);
        expect(d[0]).toStrictEqual(d[2]);
    });

    it('should handle url reference', () => {
        const url = new URL('https://www.google.com/');
        const arr = [url, 42, url];
        const s = serialize(arr);
        console.log(s);
        const d = deserialize<any[]>(s);
        expect(d[0]).toStrictEqual(d[2]);
    });
});

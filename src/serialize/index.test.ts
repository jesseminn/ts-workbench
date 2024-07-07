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

    it('should sort keys of a set', () => {
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

    it('should handle circular references', () => {
        const obj: Record<string, any> = { foo: 'bar' };
        obj.self = obj;
        serialize(obj);
    });

    const map = new Map();
    map.set('foo', 42);
    map.set('bar', { baz: 66 });
    map.set({ yee: true }, [123]);

    const set = new Set();
    set.add('foo');

    const obj = {
        // b: 'foo',
        // a: 42,
        // c: NaN,
        // d: 99n,
        // e: false,
        // arr: [1, false, { foo: 999 }],
        // s: set,
        // m: map,
        // obj: {
        //     bar: 44,
        // },
        // fn(x: number) {
        //     console.log('call fn', x);
        //     alert(x);
        // },
        // neg: -Infinity,
        [Symbol('foo')]: 444, // not supported (yet)
    };
    const serialized = serialize(obj);
    console.log('serialized:', serialized);
    const deserialized = deserialize<typeof obj>(serialized);
    console.log('deserialized:', deserialized);
});

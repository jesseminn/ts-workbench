import { serialize, deserialize } from '.';

describe('serialize', () => {
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

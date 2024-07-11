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

// const obj = { foo: 42 };
// obj.self = obj;
// const s = serialize(obj);
// const d = deserialize(s);
// console.log(d);

// const arr: any[] = [123];
// const obj = { a: 42, b: arr, c: [arr] };
// const s = serialize(obj);
// const d = deserialize(s);
// console.log(d);

// let foo = 42;
// const obj = {
//     async fn() {
//         console.log(foo);
//     },
// };
// const s = serialize(obj);
// const d = deserialize(s);
// console.log(d);
// d.fn({ foo: 66 })();

// const foo = 42;
// function fn() {
//     console.log(`this is the value of foo: ${foo}`);
// }
// const s = serialize(fn);
// console.log(s);
// const d = deserialize(s);
// console.log(d);
// d({ foo })();

// const obj = {};
// const arr = [obj, obj];
// const s = serialize(arr);
// console.log(s);
// const d = deserialize(s);
// console.log(d, d[0] === d[1]);

// TODO: make this work
// const a = { a: 1, b: 2 };
// const b = { b: 2, a: 1 };
// // a.c = b;
// // b.c = a;
// a.c = b;
// b.c = a;
// const x = serialize(a);
// const y = serialize(b);
// console.log('x', x);
// console.log('y', y);
// // try to make this work
// console.log(x === y);
// const _x = deserialize(x);
// console.log(_x);

// const obj: Record<string, any> = {};
// obj.bar = obj;
// obj.baz = [obj];
// const s = serialize(obj);
// console.log(s);
// const d = deserialize(s);
// console.log(d);

/*
const date = new Date();
const obj = {
    a: date,
    b: date,
};
const s = serialize(date);
console.log(s);
const p = deserialize(s);
console.log(p);
console.log(obj.a === obj.b);
*/

/* test map circular ref
const map = new Map();
// map.set('bar', map);
map.set(map, 42);
const s = serialize(map);
// console.log(s);
const d = deserialize(s);
console.log(d);
// console.log(d);
*/

/*
const arr: Array<any> = [1];
arr[1] = arr;
const s = serialize(arr);
console.log(s);
const d = deserialize(s);
console.log(d);
*/

/*
const set = new Set();
set.add(set);
const s = serialize(set);
console.log(s);
const d = deserialize(s);
console.log(d);
*/

// const obj: Record<any, any> = {};
// obj.foo = obj;
// const set = new Set();
// set.add(set);
// obj.set = set;
// class F {}
// const f = new F();
// obj.f = f;

// const s = serialize(obj);
// const d = deserialize(s);
// console.log(d);

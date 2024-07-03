import { EventEmitter } from '.';

test('EventEmitter', () => {
    console.log = jest.fn();

    const e = new EventEmitter();
    e.on(() => {
        console.log('#1');
    });
    const cb = () => {
        console.log('#2');
        e.off(cb);
    };
    e.on(cb);
    e.on(() => {
        console.log('#3');
    });
    e.emit();
    expect(console.log).toHaveBeenCalledWith('#1');
    expect(console.log).toHaveBeenCalledWith('#2');
    expect(console.log).toHaveBeenCalledWith('#3');
});

describe('EventEmitter', () => {
    const event = new EventEmitter();

    // confusing cases

    // 1.
    event.on(() => {
        console.log('#1');
        // add another listener, this sould this work?
        // this callback should be added after current loop is ended!
        event.on(() => {
            console.log('#2');
        });
    });

    // 2.
    event.on(() => {
        console.log('#1');
        // should this work?
        // should just let stack overflow happen?
        // or should it throw?
        // or just return a false?
        event.emit();
    });

    // 3.
    const fn1 = () => {
        console.log('#1');
        event.off(fn2);
    };
    const fn2 = () => {
        console.log('#2');
    };
    event.on(fn1);
    event.on(fn2);
    // should call fn2 or not?
    // I think should call fn2
    event.emit();

    // 4.
    const f1 = () => {
        console.log('f1');
    };
    const f2 = () => {
        console.log('f2');
    };
    event.on(f1);
    event.on(f2);
    event.once(f1);
    // should log f1 -> f2 or f2 -> f1?
    event.emit();
});

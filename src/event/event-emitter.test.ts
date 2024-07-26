import { EventEmitter } from './event-emitter';

describe('event-emitter', () => {
    const log = jest.fn();

    it('should not add new listener during loop', () => {
        const emitter = new EventEmitter();
        emitter.addListener(() => {
            log('#1');
        });
        emitter.addListener(() => {
            log('#2');
            emitter.addListener(() => {
                log('#3');
            });
        });
        emitter.emit();
        expect(log).toHaveBeenCalledTimes(2);
        expect(log).toHaveBeenNthCalledWith(1, '#1');
        expect(log).toHaveBeenNthCalledWith(2, '#2');
        log.mockClear();
        emitter.emit();
        expect(log).toHaveBeenCalledTimes(3);
        expect(log).toHaveBeenNthCalledWith(1, '#1');
        expect(log).toHaveBeenNthCalledWith(2, '#2');
        expect(log).toHaveBeenNthCalledWith(3, '#3');
    });

    it('should not remove listeners during loop', () => {
        const emitter = new EventEmitter();
        const removeListener1 = emitter.addListener(() => {
            log('#1');
            removeListener2();
        });
        const removeListener2 = emitter.addListener(() => {
            log('#2');
            removeListener1();
        });
        emitter.emit();
        expect(log).toHaveReturnedTimes(2);
        log.mockClear();
        // listeners are moved on loop ends
        emitter.emit();
        expect(log).toHaveBeenCalledTimes(0);
    });

    it('should not emit during loop', () => {
        const emitter = new EventEmitter();
        emitter.addListener(() => {
            log('#1');
        });
        emitter.addListener(() => {
            log('#2');
            const result = emitter.emit();
            expect(result).toBe(false);
        });
        emitter.emit();
        expect(log).toHaveBeenCalledTimes(2);
    });

    it('should add listener to the end of the queue', () => {
        const emitter = new EventEmitter();
        const fn1 = jest.fn();
        const fn2 = jest.fn();
        emitter.addListener(fn1);
        emitter.addListener(fn2);
        // this should move fn1 to the end of the queue
        emitter.addListener(fn1);
        emitter.emit();
        // fn2 should be called before fn1
        // ref: https://stackoverflow.com/a/58235249
        expect(fn2.mock.invocationCallOrder[0]).toBeLessThan(fn1.mock.invocationCallOrder[0]);
        // fn1 should still be call once
        expect(fn1).toHaveBeenCalledTimes(1);
    });
});

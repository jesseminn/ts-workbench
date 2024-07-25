export function debounceTrailing<I extends Array<unknown>, O>(
    fn: (...args: I) => O extends Promise<unknown> ? never : O,
    duration: number,
) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: I) => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, duration);
    };
}

// only accept sync function
// the return value will always be `void` because debounce is async
// if you need the result, use `debounceTrailingAsync` instead
// const f1 = debounceTrailing(() => 42, 500)

// will have type error
// const f2 = debounceTrailing(() => new Promise<void>(() => {}), 500)
// const f3 = debounceTrailing(async () => {}, 500)

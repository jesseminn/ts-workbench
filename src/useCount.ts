import { useState } from 'react';

export const useCount = (initialCount: number) => {
    const [count, setCount] = useState(initialCount);
    const increment = () => setCount(current => current + 1);
    const decrement = () => setCount(current => current - 1);
    return {
        count,
        increment,
        decrement,
    };
};

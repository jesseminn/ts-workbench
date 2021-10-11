import { renderHook, act } from '@testing-library/react-hooks';

import { useCount } from './useCount';

describe('useCount', () => {
    it('should be 1', () => {
        const { result } = renderHook(() => useCount(0));
        act(() => {
            result.current.increment();
        });
        expect(result.current.count).toBe(1);
    });
});

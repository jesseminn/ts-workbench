import { concat } from '.';
import { wait } from '../wait';

describe('concatFn', () => {
    it('should concat async callbacks', () => {
        // https://www.typescriptlang.org/play/?#code/GYVwdgxgLglg9mABAdwIYygCgCYgE6qwIBciYIAtgEYCmeAlIgN4BQi7ieNU+SYNyRAAU8cCjADONTJi4S4AGwBuNRgF4AfIilQAKjAo04ILHMUqANIlwEiYevQDcLAL4t3oSHcQQEEQgA8AJKINAAeUDRg2BKI4ADWYHDIYADaALpWAPIamMBgpJgAdCUwpEHqWlmMrByICtyIAA6i4lKkImKSNAE5iAA+cdE0wDD82M5sHFw8eEie0PBIxaXl9KRZzFN1iDDAiJgAhC1dUjXbOxy+YBJQiMZQTSaIaoj5K0UwTheXu-uYDyedzGt1QkCM+06bVUW1+cJO0Je9xMQOccN+M14yMeJjR6MQLlCCiksPxnG4WMBuJ+lzcv0JNGJNFJ6IR3SRbKkRSgAAsojJKiyyexrrdsUCke8Sp9vsK6nsDlTgTcoGCIBDhK1uuc5RiKXNxSYafiGUyhbr2JiDUq8bq6SbZfirUhOczULEsra6vb2C5nG4WA07r5wHdXgAGdyiu75JHXfxYd0AT0gB0FtSuCHkDSKCjgAHNMAByUF4KBFqwhsBQegXVBoDAodBYACM4fbjpFWcUNFzBeL2AQNArPmM1c7o9DiAA1K8WxdnZPq65vix3k5EAB6Tf1AuIFuIVDASJ4fcSNdgTAb7e7-OIABMh+PdAf5-Xji3O7zd4AzE+T4gP7nkAA
        let count = 0;

        const fn = concat(async () => {
            console.log('start', count, new Date().toISOString());
            await wait(1000);
            console.log('done', count, new Date().toISOString());
            count += 1;
            return count;
        });

        /*
        fn(); // log 1 after 1s
        fn(); // log 2 after 2s
        fn(); // log 3 after 3s
        */
    });
});

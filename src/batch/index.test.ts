import { batch } from '.';
import { wait } from '../wait';
import { randomInt } from '../random';

jest.useFakeTimers();

type UserInfo = {
    uid: string;
    age: number;
};

// fake api
const fetchUserInfo = jest.fn(async (uids: string[]): Promise<UserInfo[]> => {
    await wait(1000);
    return uids.map(uid => {
        return {
            uid,
            age: randomInt([0, 100]),
        };
    });
});

describe('batch', () => {
    it('should batch requests', () => {
        const batchedFetchUserInfo = batch(fetchUserInfo, {
            type: 'debounce',
            duration: 1000,
            select: (i, o) => {
                return i === o.uid;
            },
        });

        batchedFetchUserInfo('aaa').then(userInfo => {
            console.log(userInfo);
        });
        batchedFetchUserInfo('bbb').then(userInfo => {
            console.log(userInfo);
        });

        setTimeout(() => {
            batchedFetchUserInfo('ccc').then(userInfo => {
                console.log(userInfo);
            });
        }, 500);

        jest.advanceTimersByTime(1500);

        expect(fetchUserInfo).toHaveBeenCalledTimes(1);
        expect(fetchUserInfo).toHaveBeenCalledWith(['aaa', 'bbb', 'ccc']);
    });
});

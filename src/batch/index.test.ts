import { batch } from '.';

describe('batch', () => {
    it('should batch', () => {
        type UserInfo = {
            uid: string;
            age: number;
        };

        function fetchUserInfo(uids: string[]) {
            console.log('fetch uids', uids);
            return new Promise<UserInfo[]>(resolve => {
                setTimeout(() => {
                    resolve(
                        uids.map(uid => {
                            return {
                                uid,
                                age: Math.random(),
                            };
                        }),
                    );
                }, 1000);
            });
        }

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
        batchedFetchUserInfo('ccc').then(userInfo => {
            console.log(userInfo);
        });

        setTimeout(() => {
            batchedFetchUserInfo('xxx').then(userInfo => {
                console.log(userInfo);
            });
            batchedFetchUserInfo('yyy').then(userInfo => {
                console.log(userInfo);
            });
        }, 500);
    });
});

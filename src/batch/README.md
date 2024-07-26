# Batch

`batch` can group calls to the same action into one call.

In general, `batch` takes an `action` function `(args: I[]) => O[] | Promise<O>` and returns another function `(arg: I) => Promise<O>`.
The result of the returned function must be a `Promise` because it always needs to wait until calls to the action are batched.

## Example: N + 1 problem in React

Say we have an API `/user` which can query multiple user info by providing user ids

```tsx
// should be post
fetch(`/user_info`, { uid: ['aaa', 'bbb', 'ccc'] })'
```

And we have a component `UserListItem` which queries user info by `uid` prop

```tsx
const UserListItem = props => {
    const [info, setInfo] = useState(undefined);
    useEffect(() => {
        fetch(`/user_info`, { uid: [props.uid] }).then(res => {
            setInfo(res.data);
        });
    }, [props.uid]);

    return <div>...</div>;
};
```

Also, we have a component `UserList` which renders multiple `UserListItem`

```tsx
const UserList = () => {
    // a list of user id
    const [list, setList] = useState<number | undefined>(undefined);

    useEffect(() => {
        fetch('/my_friends').then(res => {
            setList(res.data);
        });
    }, []);

    if (list === undefined) {
        return <div>loading...</div>;
    }

    return (
        <div>
            {list?.map(uid => {
                return <UserListItem uid={uid} key={uid} />;
            })}
        </div>
    );
};
```

In this way, the API will be called N + 1 times (1 time for `/my_friends`, N times for `/user_info`).

## Reference

https://www.freecodecamp.org/news/n-plus-one-query-problem/

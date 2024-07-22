# `random`

Compare to `Math.random`, which generates PRNGs, could be predictable hence less secured,
`random` use `crypto.getRandomValues` to generate CSPRNGs with guarenteed security.

On the other hand, `random` uses a _pool_ for CSPRNGs so we don't need to generate one on every call.
The performance is [even better](https://measurethat.net/Benchmarks/Show/31451/0/mathrandom-vs-random-v2) than `Math.random`

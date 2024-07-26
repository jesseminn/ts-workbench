# `EventEmitter`

An event emitter which can handle _cofusing cases_.

## What cases?

1. Adding or removing listeners during a loop.
2. Emitting during a loop.
3. Adding the same function as a listener.

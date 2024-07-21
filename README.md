# TypeScript workbench

This repository is a collection of utils I wrote and used during my career.
Some of them might be _reinventing the wheel_, but building them by myself helps me understand how things works.

## Install this repo as npm package

This repo can be installed directly as an npm package. It automatically build itself after being installed.

```sh
npm i jesseminn/ts-workbench
```

You can fork it before installing.

### Known issue

For unknown reason, you might installed old version when installing from Github by `npm i`.
Running [`npm cache clean --force`](https://docs.npmjs.com/cli/v10/commands/npm-cache) won't help. Possible solutions on the host project side:

Instead of `npm i`, run `npm i jesseminn/ts-workbench`.

## Multiple entries

Instead of import each modules from the root entry (by setting `main` & `types` prop in `package.json`) like

```ts
import { add, subtract } from 'ts-workbench';
```

Each module has it's own entry

```ts
import { add } from 'ts-workbench/add';
import { subtract } from 'ts-workbench/add';
```

The content of each module should be:

-   `index.ts`: the entry file of the module.
-   `index.test.ts`: the tests for the module.
-   `README.md`: incuding a brief intro and feature list.
-   `NOTE.md`: including the encountered problems during development, learnings and findings.

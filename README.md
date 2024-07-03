## TODOs

prettier
remove tsx from react-workbench?

## Install this repo as npm package

This repo can be installed directly as an npm package. According to the [doc](https://docs.npmjs.com/cli/v10/commands/npm-install)

> if you do not include the @-symbol on your scope name, npm will interpret this as a GitHub repository instead

```sh
npm install user/repo

# commit-ish can be hash, branch or tag`
npm install visionmedia/express#commit-ish

# or
npm install github:user/repo
```

p.s. The `repository` field in `package.json` [also follows this rule](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#repository)

```json
{
    "repository": "user/repo",
    "repository": "github:user/repo"
}
```

See also [this answer](https://stackoverflow.com/a/21918559)

### Known issue

For unknown reason, you might installed old version when installing from Github! Running `npm cache clean --force` won't help.

Current solution: remove the package from `package.json`, run `npm i`, then add it back to `package.json`, run `npm i` again.

## `prepare` to build after installation

This repo automatically build itself after being installed by running the `prepare` script.

### `prepare` failed to run

At first `prepare` is not triggered as expected, found [this answer](https://stackoverflow.com/a/57503862) to be really helpful.

Root cause:

1. Ignored `dist` in `.gitignore`
2. If `.npmignore` is not found, `.gitignore` is used, thus `dist` is ignored by npm
3. When `prepare` run, tried to create files in `dist`, those files will be ignored by npm.

Solution:

1. Explicitly specify [`files` prop](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files) in `package.json`
2. Declare an empty `.npmignore` so `.gitignore` won't be used.

### `npx --yes`

The `build` script use `tsc` to transpile TS to JS, which will allows the script to be used in other project without `typescript` being installed. `npx` can be used to run package without installation, but it might ask the user to confirm the download.

Found [this answer](https://stackoverflow.com/a/70742969), in order to confirm automatically, do `npx --yes tsc`.

## Module structure

Instead of import each modules from the root entry (by setting `main` & `types` prop in `package.json`) like

```ts
import { add, subtract } from 'ts-workbench';
```

Each module has it's own entry

```ts
import { add } from 'ts-workbench/add';
import { subtract } from 'ts-workbench/add';
```

The configuration to achieve this

### `exports` section in `package.json`

```json
{
    "exports": {
        "./*": {
            "require": "./dist/*/index.js",
            "import": "./dist/*/index.js",
            "types": "./dist/*/index.d.ts"
        }
    }
}
```

Also check official doc abount [**conditioal exports**](https://nodejs.org/api/packages.html#conditional-exports)

### TypeScript `NodeNext`

```ts
// error
import { add } from 'ts-workbench/add';

// works
import { add } from 'ts-workbench/dist/add';
```

According to [this answer](https://stackoverflow.com/a/74485520) and [this answer](https://stackoverflow.com/a/70020984)

> TypeScript only respects export maps in `package.json` if you use `"moduleResolution": "NodeNext"`(or `"Node16"`) instead of the widespread `"moduleResolution": "Node"`.

So the _workaround_ is to set the host project's `tsconfig.json` `moduleResolution` to `NodeNext`.

## Jest

The simplest way to get Jest to work with TypeScript

1. `npm install -D jest ts-node ts-jest @types/jest`. Unfortunatly Jest does not support `tsx` (TypeScript Execute), so `ts-node` is still needed.
2. Create `jest.config.ts`

```ts
const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // others
};
```

## Reference

About creating npm packages with TypeScript
[Building and publishing NPM packages with typescript , multiple entry points, tailwind , tsup and npm](https://dev.to/tigawanna/building-and-publishing-npm-packages-with-typescript-multiple-entry-points-tailwind-tsup-and-npm-9e7)
[TypeScript NPM Package Publishing: A Beginner’s Guide](https://pauloe-me.medium.com/typescript-npm-package-publishing-a-beginners-guide-40b95908e69c)
[Creating an npm package with TypeScript](https://medium.com/@the_nick_morgan/creating-an-npm-package-with-typescript-c38b97a793cf)

Though `tsup` is not used in this repo, it's highly recommended.
[用 tsup 快速建立 Typescript 開發環境](https://johnnywang1994.github.io/book/articles/js/tsup-tutorial.html)

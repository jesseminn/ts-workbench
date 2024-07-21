# Notes about TypeScript workbench

## TODOs

-   retry (exponential backoff)
-   sort package.json and tsconfig.json in precommit hook
-   uid
-   jsdoc https://deno.com/blog/document-javascript-package & https://www.npmjs.com/package/prettier-plugin-jsdoc
-   await to (improve type definition)
-   debounceLeading
-   debounceTrailingAsync

## Install a Github repo as an npm package

According to the [npm official doc](https://docs.npmjs.com/cli/v10/commands/npm-install)

> if you do not include the `@`-symbol on your scope name, npm will interpret this as a GitHub repository instead

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

## Avoid npm cache

-   Install the repo only

    Instead of `npm i`, run `npm i jesseminn/ts-workbench` instead.

-   Remove manually

    Remove the package from `package.json`, run `npm i`, then add it back to `package.json`, run `npm i` again.

-   Manipulate cache

    There're also 2 approaches

    -   Setup `.npmrc`, specify [`cache`](https://docs.npmjs.com/cli/v9/using-npm/config#cache). Maybe set `postinstall` script to clear the cache.

        NOTICE: this will affect all packages in the project.

        https://docs.npmjs.com/cli/v9/configuring-npm/npmrc

        https://juejin.cn/post/6983522411647860766

        https://claude-ray.com/2019/12/06/npm-install-without-cache/

    -   In the host `TEMP=$(mktemp -d); npm i --cache $TEMP <package-name>; rm -rf $TEMP`.

        This will only affect the installed package.

        Inspired by [this discussion](https://stackoverflow.com/questions/36155072/disable-npm-cache)

## `prepare` a repo after being installed as an npm package

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

### `husky` overrides `prepare`

When integrating `pretteir.js` and `husky`, `husky init` overrides `prepare` to `husky`.

Solution:

```json
{
    "prepare": "[ ! -d '.git' ] && npm run build || husky"
}
```

-   Check this package is installed as package (where `.git` does not exists) or is a dev project.
-   If installed as a package, run build.
-   Else, install husky.

See [this discussion](https://github.com/typicode/husky/issues/1016#issuecomment-1767202406)

Other approach [mentioned here](https://stackoverflow.com/a/61975270): `npm install --ignore-scripts`, but this is not ideal because there might still be some package relying on the scripts.

## Package exports

In order to have multiple entries, some configuration is required.

### `package.json#exports`

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

Node.js supports `package.json#exports` since v12. However, TypeScript _by default_ does not understand it.

```ts
// works but not ideal
import { add } from 'ts-workbench/dist/add';

// error, how to make this work?
import { add } from 'ts-workbench/add';
```

There're 2 solutions(workarounds) to fix this bug:

### `tsconfig.json#compilerOptions#moduleResolution`

According to [this answer](https://stackoverflow.com/a/74485520) and [this answer](https://stackoverflow.com/a/70020984)

> TypeScript only respects export maps in `package.json` if you use `"moduleResolution": "NodeNext"`(or `"Node16"`) instead of the widespread `"moduleResolution": "Node"`.

So the _workaround_ is to

-   Use TypeScript >= v4.7
-   Set the _host project_'s `tsconfig.json#moduleResolution` to `NodeNext`.

Though [This answer](https://stackoverflow.com/a/74551879) suggests this is THE correct solution, but this solution might not be suitable for every case.

### `package.json#typesVersions`

According to [the official doc](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#version-selection-with-typesversions)

```json
"typesVersions": {
    "*": {
        "*": [
            "./dist/@types/*/index.d.ts"
        ]
    }
}
```

> For all TypeScript versions, when trying to resolve any path, read the `index.d.ts` in correspoding path

Therefore, when you do

```ts
import { add } from 'ts-workbench/add';
```

TypeScript will try to resolve `/add` and matches `./dist/@types/add/index.d.ts`.
By this way you don't have to set up `tsconfig.json#moduleResolution` to `NodeNext`, but this is

Also check

-   The [`package.json` of `rxjs`](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/package.json#L8) to see their approach.
-   [The configuration of MDN's `glean.js`](https://blog.mozilla.org/data/2021/04/07/this-week-in-glean-publishing-glean-js/)

In summary, these 2 workarounds can be used together to cover different scenarios.

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

## Prettier

Did not create`.prettierignore`, just use `--ignore-path` to read `.gitignore`.

p.s. Use `git config --get core.excludesfile` to read global `.gitignore`. [ref](https://stackoverflow.com/a/22885996)

p.s.2 `prettier` does not want to read `.gitignore` as default. [ref](https://github.com/jaredpalmer/tsdx/issues/517)

p.s.3 `prettier` throws error if parsed unknown (unsupported) files, such as pictures. Set `--ignore-unknown` can avoid this error. Check this [PR](https://github.com/prettier/prettier/pull/8829/commits/e7c27c74c34aab7f2423dd61afb9698204f1e486)

## Reference

About creating npm packages with TypeScript
[Building and publishing NPM packages with typescript , multiple entry points, tailwind , tsup and npm](https://dev.to/tigawanna/building-and-publishing-npm-packages-with-typescript-multiple-entry-points-tailwind-tsup-and-npm-9e7)
[TypeScript NPM Package Publishing: A Beginner’s Guide](https://pauloe-me.medium.com/typescript-npm-package-publishing-a-beginners-guide-40b95908e69c)
[Creating an npm package with TypeScript](https://medium.com/@the_nick_morgan/creating-an-npm-package-with-typescript-c38b97a793cf)

Though `tsup` is not used in this repo, it's highly recommended.
[用 tsup 快速建立 Typescript 開發環境](https://johnnywang1994.github.io/book/articles/js/tsup-tutorial.html)

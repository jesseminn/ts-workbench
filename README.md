# TypeScript workbench: npm package

## Known issues (React)

### Got "invalid hook call" error

```plain
Invalid hook call. Hooks can only be called inside of the body of a function component
```

Solution:
Link the React in the `node_modules` of the lib to the one in the demo app.

```sh
# Do this in lib directory
npm link demo/node_modules/react
```

Or `npm run link-react`

Reference:

https://stackoverflow.com/a/63705440

## Known issues

-   Run `npm i` to install dependencies also triggers `npm prepare` -> `npm build`, which might be OK if you just started a project, but could be annoying when you already built something and tried to install new dependencies, `tsc` might throw error if your code failed to compile while you just wanna install something!

-   For unknown reason, you might installed old version when installing from Github! Running `npm cache clean --force` won't help. Current solution: remove the package from `package.json`, run `npm i`, then add it back to `package.json`, run `npm i` again.

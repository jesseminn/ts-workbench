# TypeScript workbench: npm package

## Known issues

-   Run `npm i` to install dependencies also triggers `npm prepare` -> `npm build`, which might be OK if you just started a project, but could be annoying when you already built something and tried to install new dependencies, `tsc` might throw error if your code failed to compile while you just wanna install something!

-   For unknown reason, you might installed old version when installing from Github! Running `npm cache clean --force` won't help. Current solution: remove the package from `package.json`, run `npm i`, then add it back to `package.json`, run `npm i` again.

# TypeScript workbench

A starting point for TypeScript projects

## Implementations

-   Minimal Webpack & Jest config
-   Opinionated TypeScript config
-   Support TypeScript `paths`

## How to use

### As a starting point

```sh
git clone https://github.com/jesseminn/ts-workbench.git
```

### Integrate existing project

```sh
git remote add ts-workbench https://github.com/jesseminn/ts-workbench.git
git fetch ts-workbench
git merge ts-workbench/master --squash --allow-unrelated-histories
# After solving conflicts
git commit -m"Integrated ts-workbench"
npm i
```

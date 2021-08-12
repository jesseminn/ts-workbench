# TypeScript workbench

A starting point for TypeScript projects

## Implementations

-   Minimal Webpack & Jest config
-   Opinionated TypeScript config
-   Support TypeScript `paths`

## How to use

`ts-workbranch` contains 3 starting points as branches:

-   `app` for normal web app development
-   `react-app` for React web app development
-   `npm-package` for NPM package development

### As a starting point

```sh
mkdir my-project
cd my-project

# Clone content into current directory
git clone --branch <branch-name> --single-branch https://github.com/jesseminn/ts-workbench.git .

# Optional, remove history
rm -rf .git

# If you removed .git, don't forget to init a new one
git --init
git add .
git commit -m "Init"

# Add your own remote repo
git remote add origin <github-repo-url>
```

### Integrate existing project

```sh
git remote add ts-workbench https://github.com/jesseminn/ts-workbench.git
git fetch ts-workbench
git merge ts-workbench/<branch-name> --squash --allow-unrelated-histories
# After solving conflicts
git commit -m"Integrated ts-workbench"
npm i
```

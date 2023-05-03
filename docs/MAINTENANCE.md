# Maintenance

This document describes updating the [examples](../examples) in this repository to use the latest Cypress version.

## Examples

There are two groups of examples which are used to test and demonstrate the use of [cypress-io/github-action](https://github.com/cypress-io/github-action):

1. The [examples](../examples) directory contains examples of the use of Cypress (Current) [Configuration](https://docs.cypress.io/guides/references/configuration) which applies to Cypress 10 and later.

2. The [examples/v9](../examples/v9) directory contains examples which are set up to use Cypress `9.7.0` which is the last version using [Legacy Configuration](https://docs.cypress.io/guides/references/legacy-configuration) which applies to Cypress 9 and below.

The examples make use of [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/) and [Yarn 1 (Classic)](https://classic.yarnpkg.com/) to define and install the packages being used.

## Prerequisites

- A local system running [Ubuntu](https://ubuntu.com/), [Microsoft Windows](https://www.microsoft.com/windows/) or [Apple macOS](https://www.apple.com/macos/).

- The LTS version of [Node.js](https://nodejs.org/). For convenience of switching to other versions of Node.js, [nvm](https://github.com/nvm-sh/nvm) for unix, macOS and windows WSL. For Windows [nvm-windows](https://github.com/coreybutler/nvm-windows).

- [git](https://git-scm.com/) distributed version control system.

- [npm](https://www.npmjs.com/), which is installed with [Node.js](https://nodejs.org/)

- [pnpm](https://pnpm.io/) installed through:

```bash
npm install pnpm@latest -g
```

This needs to be repeated if you change the base node version using nvm.

- [Yarn 1 (Classic)](https://classic.yarnpkg.com/) installed through:

```bash
npm install yarn@latest -g
```

Again, this needs to be repeated if you change the base node version using nvm.

- [Visual Studio Code](https://code.visualstudio.com/) or other editor

Under Microsoft Windows it may be necessary to also execute the following preparatory command:

```bash
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe" --location user
```

## Updating examples

When a new version of [Cypress](https://docs.cypress.io/guides/references/changelog) is published, the examples can be updated.

From the root of a local clone of the repository, execute:

```bash
npm run update:cypress
```

This updates all [examples](../examples) (except [examples/v9](../examples/v9)) to cypress@latest.

[.github/workflows/example-install-only.yml](../.github/workflows/example-install-only.yml) contains a hard-coded Cypress version number. This can be updated by hand.

After updating the examples locally, they can be committed with git and a pull request opened on GitHub.

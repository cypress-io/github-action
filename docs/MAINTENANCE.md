# Maintenance

This document describes updating the [examples](../examples) in this repository to use the latest Cypress version.

## Examples

The [examples](../examples) directory contains examples of the use of Cypress (Current) [Configuration](https://docs.cypress.io/guides/references/configuration) which applies to Cypress 10 and later. These examples test and demonstrate the use of [cypress-io/github-action](https://github.com/cypress-io/github-action).

The examples make use of [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [Yarn 1 (Classic)](https://classic.yarnpkg.com/) and [Yarn Modern](https://yarnpkg.com/) (Yarn 2 and later) to define and install the packages being used.

*The previous [examples/v9](https://github.com/cypress-io/github-action/tree/v5/examples/v9) are archived in the [v5](https://github.com/cypress-io/github-action/tree/v5/) branch. This directory contains examples which were set up to use Cypress `9.7.0`, the last version using [Legacy Configuration](https://docs.cypress.io/guides/references/legacy-configuration), covering Cypress 9 and below. These `v9` examples are no longer maintained.

## Requirements

- A local system running [Ubuntu](https://ubuntu.com/), <!-- markdown-link-check-disable -->[Microsoft Windows](https://www.microsoft.com/windows/)<!-- markdown-link-check-enable --> or [Apple macOS](https://www.apple.com/macos/).

- [Node.js](https://nodejs.org/en/) as described in the [CONTRIBUTING](../CONTRIBUTING.md#requirements) document.

- [git](https://git-scm.com/) distributed version control system.

- [npm](https://www.npmjs.com/), which is installed with [Node.js](https://nodejs.org/)

- [pnpm](https://pnpm.io/) installed through:

```bash
npm install pnpm@latest -g
```

- [Yarn 1 (Classic)](https://classic.yarnpkg.com/) installed through:

```bash
npm install yarn@latest -g
```

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

This updates all [examples](../examples) to cypress@latest.

[.github/workflows/example-install-only.yml](../.github/workflows/example-install-only.yml) contains a hard-coded Cypress version number. This can be updated by hand.

After updating the examples locally, they can be committed with git and a pull request opened on GitHub.

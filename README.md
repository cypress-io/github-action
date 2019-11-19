# @cypress/github-action [![renovate-app badge][renovate-badge]][renovate-app] [![Action status](https://github.com/cypress-io/github-action/workflows/main/badge.svg?branch=master)](https://github.com/cypress-io/github-action/actions)

> [GitHub Action](https://help.github.com/en/actions) for running [Cypress](https://www.cypress.io) end-to-end tests

## Examples

### Basic

```yml
name: End-to-end tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      # Install NPM dependencies, cache them correctly
      # and run all Cypress tests
      - name: Cypress run
        uses: cypress-io/github-action@v1
```

### Browser

Specify the browser name or path with `browser` parameter

```yml
name: E2E on Chrome
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    # let's make sure our tests pass on Chrome browser
    name: E2E on Chrome
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v1
        with:
          browser: chrome
```

### Record test results on Cypress Dashboard

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          record: true
        env:
          # pass the Dashboard record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

### Config

Specify [configuration](https://docs.cypress.io/guides/references/configuration.html) values with `config` parameter


```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          config: pageLoadTimeout=100000,watchForFileChanges=false
```

### Config File

Specify the path to your config file with `config-file` parameter

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          config-file: tests/cypress-config.json
```

### Parallel

You can spin multiple containers running in parallel using `strategy: matrix` argument. Just add more dummy items to the `containers: [1, 2, ...]` array to spin more free or paid containers. Then use `record` and `parallel` parameters to [load balance tests](https://on.cypress.io/parallelization)

```yml
name: Parallel Cypress Tests

on: [push]

jobs:
  test:
    name: Cypress run
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # run 3 copies of the current job in parallel
        containers: [1, 2, 3]
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      # because of "record" and "parallel" parameters
      # these containers will load balance all found tests among themselves
      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          record: true
          parallel: true
          group: 'Actions example'
        env:
          # pass the Dashboard record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

![Parallel run](images/parallel.png)

**Warning ⚠️:** Cypress Dashboard API connects parallel jobs into a single logical run using GitHub commit SHA plus workflow name, since there is no better unique ID during GitHub Action execution. Thus if you attempt to re-run GitHub checks, the Dashboard thinks the run has already ended. In order to truly rerun parallel jobs, push an empty commit with `git commit --allow-empty -m "re-run checks" && git push`.

### Build app

You can run a build step before starting tests

```yml
name: Build
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          build: npm run build
```

### Start server

If your tests run against a local server, use `start` parameter, the server will run in the background and will shut down after tests complete

```yml
name: With server
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          start: npm start
```

**Note:** sometimes on Windows you need to run a different start command. You can use `start-windows` parameter for this

```yml
name: With server
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          # Linux and MacOS
          start: npm start
          # Takes precedences on Windows
          start-windows: npm run start:windows:server
```

### Wait-on

If you are starting a local server and it takes a while to start, you can add a parameter `wait-on` and pass url to wait for the server to respond. Uses [wait-on](https://www.npmjs.com/package/wait-on) under the hood.

```yml
name: After server responds
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          start: npm start
          wait-on: http://localhost:8080
```

### Working directory

In a monorepo, the end-to-end test might be placed in a different sub-folder from the application itself, like this

```text
repo/
  app/
  e2e/
    cypress
    cypress.json
  package.json
```

You can specify the `e2e` working directory when running Cypress tests using `working-directory` parameter

```yml
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v1
        with:
          start: npm start
          working-directory: e2e
```

See [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) for a running example

### Custom cache key

Sometimes the default cache key does not work. For example, if you cannot share the Node modules across Node versions due to native extensions. In that case pass your own `cache-key` parameter.

```yml
name: End-to-end tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    # let's make sure our "app" works on several versions of Node
    strategy:
      matrix:
        node: [10, 12]
    name: E2E on Node v${{ matrix.node }}
    steps:
      - name: Setup Node
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}
      - name: Checkout
        uses: actions/checkout@v1
      # run Cypress tests and record them under the same run
      # associated with commit SHA and just give a different group name
      - name: Cypress run
        uses: cypress-io/github-action@v1
        with:
          record: true
          group: Tests on Node v${{ matrix.node }}
          cache-key: node-v${{ matrix.node }}-on-${{ runner.os }}-hash-${{ hashFiles('yarn.lock') }}
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

### Split install and tests

Sometimes you may want to run additional commands between installation and tests. To enable this use the `install` and `runTests` parameters.

```yml
name: E2E
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - name: Install dependencies
        uses: cypress-io/github-action@v1
        with:
          # just perform install
          runTests: false
      - run: yarn lint
      - name: Run e2e tests
        uses: cypress-io/github-action@v1
        with:
          # we have already installed all dependencies above
          install: false
          # Cypress tests and config file are in "e2e" folder
          working-directory: e2e
```

See [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) for working example.

### More examples

| Name                                                                                 | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [cypress-gh-action-example](https://github.com/bahmutov/cypress-gh-action-example)   | Uses Yarn, and runs in parallel on several versions of Node, also different browsers |
| [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) | splits install and running tests commands, runs Cypress from sub-folder              |

## Notes

### Installation

This action installs local dependencies using lock files. If `yarn.lock` file is found, the install uses `yarn --frozen-lockfile` command. Otherwise it expects to find `package-lock.json` and install using `npm ci` command.

### Debugging

You can see verbose messages from GitHub Actions by setting the following secrets (from [Debugging Actions Guide](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#step-debug-logs))

```
ACTIONS_RUNNER_DEBUG: true
ACTIONS_STEP_DEBUG: true
```

## More information

- [Building actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/building-actions) docs

## License

[MIT License](./LICENSE.md)

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

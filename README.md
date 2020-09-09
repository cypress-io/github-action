# cypress-io/github-action [![renovate-app badge][renovate-badge]][renovate-app] [![Action status](https://github.com/cypress-io/github-action/workflows/main/badge.svg?branch=master)](https://github.com/cypress-io/github-action/actions) [![renovate-app badge][renovate-badge]][renovate-app]

> [GitHub Action](https://help.github.com/en/actions) for running [Cypress](https://www.cypress.io) end-to-end tests. Includes NPM installation, custom caching and lots of configuration options.

## Examples

### Basic

```yml
name: End-to-end tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      # Install NPM dependencies, cache them correctly
      # and run all Cypress tests
      - name: Cypress run
        uses: cypress-io/github-action@v2
```

[![Basic example](https://github.com/cypress-io/github-action/workflows/example-basic/badge.svg?branch=master)](.github/workflows/example-basic.yml)

### Browser

Specify the browser name or path with `browser` parameter

```yml
name: E2E on Chrome
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    # let's make sure our tests pass on Chrome browser
    name: E2E on Chrome
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          browser: chrome
```

[![Chrome example](https://github.com/cypress-io/github-action/workflows/example-chrome/badge.svg?branch=master)](.github/workflows/example-chrome.yml)

### Headless

Run the browser in headless mode

```yml
name: Chrome headless
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          browser: chrome
          headless: true
```

### Docker image

You can run tests in a GH Action in your Docker container.

```yml
name: E2E in custom container
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    # Cypress Docker image with Chrome v78
    # and Firefox v70 pre-installed
    container: cypress/browsers:node12.13.0-chrome78-ff70
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          browser: chrome
```

### Firefox

In order to run Firefox, you need to use non-root user (Firefox security restriction).

```yml
name: Firefox
on: push
jobs:
  firefox:
    runs-on: ubuntu-latest
    container:
      image: cypress/browsers:node12.16.1-chrome80-ff73
      options: --user 1001
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          browser: firefox
```

[![Firefox example](https://github.com/cypress-io/github-action/workflows/example-firefox/badge.svg?branch=master)](.github/workflows/example-firefox.yml)

**Note:** the magical user id `1001` works because it matches permissions settings on the home folder, see issue [#104](https://github.com/cypress-io/github-action/issues/104)

### Edge

```yml
name: Edge
on: push
jobs:
  tests:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          browser: edge
```

[![Edge example](https://github.com/cypress-io/github-action/workflows/example-edge/badge.svg?branch=master)](.github/workflows/example-edge.yml)

**Note:** Microsoft has not released Edge for Linux yet, thus you need to run these tests on Windows or Mac runners with Edge preinstalled. You can use [`cypress info`](https://on.cypress.io/command-line#cypress-info) command to see the browsers installed on the machine.

### Env

Specify the env argument with `env` parameter

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run with env
        uses: cypress-io/github-action@v2
        with:
          env: host=api.dev.local,port=4222
```

[![Env example](https://github.com/cypress-io/github-action/workflows/example-env/badge.svg?branch=master)](.github/workflows/example-env.yml)

### Specs

Specify the [spec files to run](https://docs.cypress.io/guides/guides/command-line.html#cypress-run-spec-lt-spec-gt) with `spec` parameter

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          spec: cypress/integration/spec1.js
```

For more information, visit [the Cypress command-line docs](https://on.cypress.io/command-line#cypress-run-env-lt-env-gt).

### Project

Specify the [project to run](https://docs.cypress.io/guides/guides/command-line.html#cypress-run-project-lt-project-path-gt) with `project` parameter

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          project: ./some/nested/folder
```

For more information, visit [the Cypress command-line docs](https://on.cypress.io/command-line#cypress-run-project-lt-project-path-gt).

### Record test results on Cypress Dashboard

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          record: true
        env:
          # pass the Dashboard record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          # pass GitHub token to allow accurately detecting a build vs a re-run build
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

[![recording example](https://github.com/cypress-io/github-action/workflows/example-recording/badge.svg?branch=master)](.github/workflows/example-recording.yml)

**Tip 1:** We recommend using the action with `on: [push]` instead of `on: [pull_request]` to get the most accurate information related to the commit on the dashboard. With pull requests, the merge commit is created automatically and might not correspond to a meaningful commit in the repository.

**Tip 2:** we recommend passing the `GITHUB_TOKEN` secret (created by the GH Action automatically) as an environment variable. This will allow correctly identifying every build and avoid confusion when re-running a build.

**Tip 3:** if running on `pull_request` event, the commit message is "merge SHA into SHA", which is not what you want probably. You can overwrite the commit message sent to the Dashboard by setting an environment variable. See [issue 124](https://github.com/cypress-io/github-action/issues/124#issuecomment-653180260) for details.

### Quiet flag

You can provide `quiet` flag for cypress run to silence any Cypress specific output from stdout

```yml
name: example-quiet
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      # Install NPM dependencies, cache them correctly
      # and run all Cypress tests with `quiet` parameter
      - name: Cypress run
        uses: ./
        with:
          working-directory: examples/quiet
          quiet: true
```

[![example-quiet](https://github.com/cypress-io/github-action/workflows/example-quiet/badge.svg?branch=master)](.github/workflows/example-quiet.yml)

### Tag recordings

You can pass a single or multiple tags when recording a run. For example

```yml
name: tags
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
      - run: node -v

      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          record: true
          tag: node-${{ matrix.node }}
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The recording will have tags as labels on the run.

![Tags](images/tags.png)

You can pass multiple tags using commas like `tag: node-10,nightly,staging`.

### Artifacts

If you don't record the test run on Cypress Dashboard, you can still store generated videos and screenshots as CI artifacts. See [cypress-gh-action-example](https://github.com/bahmutov/cypress-gh-action-example) and the workflow example below

```yml
name: Artifacts
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    name: Artifacts
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
      # after the test run completes
      # store videos and any screenshots
      # NOTE: screenshots will be generated only if E2E test failed
      # thus we store screenshots only on failures
      # Alternative: create and commit an empty cypress/screenshots folder
      # to always have something to upload
      - uses: actions/upload-artifact@v1
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
      # Test run video was always captured, so this action uses "always()" condition
      - uses: actions/upload-artifact@v1
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

### Config

Specify [configuration](https://docs.cypress.io/guides/references/configuration.html) values with `config` parameter

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          config: pageLoadTimeout=100000,baseUrl=http://localhost:3000
```

### Config File

Specify the path to your config file with `config-file` parameter

```yml
name: Cypress tests
on: [push]
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Cypress run
        uses: cypress-io/github-action@v2
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
    runs-on: ubuntu-16.04
    strategy:
      # when one test fails, DO NOT cancel the other
      # containers, because this will kill Cypress processes
      # leaving the Dashboard hanging ...
      # https://github.com/cypress-io/github-action/issues/48
      fail-fast: false
      matrix:
        # run 3 copies of the current job in parallel
        containers: [1, 2, 3]
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      # because of "record" and "parallel" parameters
      # these containers will load balance all found tests among themselves
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          record: true
          parallel: true
          group: 'Actions example'
        env:
          # pass the Dashboard record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          # Recommended: pass the GitHub token lets this action correctly
          # determine the unique run id necessary to re-run the checks
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

![Parallel run](images/parallel.png)

**Warning ⚠️:** Cypress action use `GITHUB_TOKEN` to get the correct branch and the number of jobs runed, making it possible to re-run without the need of pushing an empty commit. If you don't want to use the `GITHUB_TOKEN` you can still run your tests without problem with the only note that Cypress Dashboard API connects parallel jobs into a single logical run using GitHub commit SHA plus workflow name. If you attempt to re-run GitHub checks, the Dashboard thinks the run has already ended. In order to truly rerun parallel jobs, push an empty commit with `git commit --allow-empty -m "re-run checks" && git push`. As another work around you can generate and cache a custom build id, read [Adding a unique build number to GitHub Actions](https://medium.com/attest-engineering/adding-a-unique-github-build-identifier-7aa2e83cadca)

### Build app

You can run a build step before starting tests

```yml
name: Build
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v2
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
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          start: npm start
```

**Note:** sometimes on Windows you need to run a different start command. You can use `start-windows` parameter for this

```yml
name: With server
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          # Linux and MacOS
          start: npm start
          # Takes precedences on Windows
          start-windows: npm run start:windows:server
```

[![start example](https://github.com/cypress-io/github-action/workflows/example-start/badge.svg?branch=master)](.github/workflows/example-start.yml)

### Wait-on

If you are starting a local server and it takes a while to start, you can add a parameter `wait-on` and pass url to wait for the server to respond.

```yml
name: After server responds
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          start: npm start
          # quote the url to be safe against YML parsing surprises
          wait-on: 'http://localhost:8080'
```

By default, `wait-on` will retry for 60 seconds. You can pass a custom timeout in seconds using `wait-on-timeout`.

```yml
- uses: cypress-io/github-action@v2
  with:
    start: npm start
    wait-on: 'http://localhost:8080/status'
    # wait for 2 minutes for the server to respond
    wait-on-timeout: 120
```

### Command prefix

You can prefix the default test command using the `command-prefix` option. This is useful for example when running [Percy](https://docs.percy.io/docs/cypress), which requires the test command to be wrapped with `percy exec --`.

```yml
name: Visual
on: [push]
jobs:
  e2e:
    runs-on: ubuntu-16.04
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          start: npm start
          # quote the url to be safe against YML parsing surprises
          wait-on: 'http://localhost:8080'
          # the entire command will automatically be prefixed with "npm"
          # and we need the second "npm" to execute "cypress run ..." command line
          command-prefix: 'percy exec -- npx'
```

See live example [angular-pizza-creator](https://github.com/cypress-io/angular-pizza-creator).

### Custom test command

You can overwrite the Cypress run command with your own

```yml
steps:
  - name: Checkout 🛎
    uses: actions/checkout@v1

  - name: Custom tests 🧪
    uses: cypress-io/github-action@v1
    with:
      command: npm run e2e:ci
```

See [.github/workflows/example-custom-command.yml](.github/workflows/example-custom-command.yml) file.

### Custom build id

You can overwrite [`ci-build-id`](https://on.cypress.io/parallelization#Linking-CI-machines-for-parallelization-or-grouping) used to link separate machines running tests into a single parallel run.

```yml
name: Parallel
on: [push]
jobs:
  test:
    runs-on: ubuntu-16.04
    strategy:
      matrix:
        # run 3 copies of the current job in parallel
        containers: [1, 2, 3]
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          record: true
          parallel: true
          group: 'Actions example'
          ci-build-id: '${{ github.sha }}-${{ github.workflow }}-${{ github.event_name }}'
        env:
          # pass the Dashboard record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Tip:** see GitHub Actions [environment variables](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/using-environment-variables) and [expression syntax](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/contexts-and-expression-syntax-for-github-actions).

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
    runs-on: ubuntu-16.04
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          start: npm start
          working-directory: e2e
```

See [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) for a running example

### Subfolders

Sometimes Cypress and end-to-end tests have their own `package.json` file in a subfolder, like

```text
root/
  e2e/
    (code for installing and running Cypress tests)
    package.json
    package-lock.json
    cypress.json
    cypress

  (code for running the "app" with "npm start")
  package.json
  yarn.lock
```

In that case you can combine this action with [bahmutov/npm-install](https://github.com/bahmutov/npm-install) action to install dependencies separately.

```yml
name: E2E
on: push
jobs:
  test:
    runs-on: ubuntu-16.04
    steps:
      - uses: actions/checkout@master
      - name: Install root dependencies
        uses: bahmutov/npm-install@v1

      - name: Start server in the background
        run: npm start &

      # Cypress has its own package.json in folder "e2e"
      - name: Install Cypress and run tests
        uses: cypress-io/github-action@v2
        with:
          working-directory: e2e
```

See [cypress-gh-action-subfolders](https://github.com/bahmutov/cypress-gh-action-subfolders) for example.

### Yarn workspaces

This action should discover Yarn workspace correctly. For example, see folder [examples/start-and-yarn-workspaces](examples/start-and-yarn-workspaces) and workflow file [example-start-and-yarn-workspaces.yml](.github/workflows/example-start-and-yarn-workspaces.yml)

```yaml
name: example-start-and-yarn-workspaces
on: [push]
jobs:
  single:
    # the example has Yarn workspace in its "root" folder
    # examples/start-and-yarn-workspaces
    # and tests in a subfolder like "workspace-1"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
        with:
          working-directory: examples/start-and-yarn-workspaces/workspace-1
          build: yarn run build
          start: yarn start
          wait-on: 'http://localhost:5000'
```

[![Yarn workspaces example](https://github.com/cypress-io/github-action/workflows/example-start-and-yarn-workspaces/badge.svg?branch=master)](.github/workflows/example-start-and-yarn-workspaces.yml)

### Custom cache key

Sometimes the default cache key does not work. For example, if you cannot share the Node modules across Node versions due to native extensions. In that case pass your own `cache-key` parameter.

```yml
name: End-to-end tests
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-16.04
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
        uses: cypress-io/github-action@v2
        with:
          record: true
          group: Tests on Node v${{ matrix.node }}
          cache-key: node-v${{ matrix.node }}-on-${{ runner.os }}-hash-${{ hashFiles('yarn.lock') }}
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Node versions

You can run your tests across multiple Node versions.

```yml
name: Node versions
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [10, 12]
    name: E2E on Node v${{ matrix.node }}
    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}
      - uses: actions/checkout@v1
      - uses: cypress-io/github-action@v2
```

[![Node versions example](https://github.com/cypress-io/github-action/workflows/example-node-versions/badge.svg?branch=master)](.github/workflows/example-node-versions.yml)

**Note:** because this action uses `npm ci` and `npx` commands, it requires at least Node 8.12 that includes the version of NPM with those commands.

### Split install and tests

Sometimes you may want to run additional commands between installation and tests. To enable this use the `install` and `runTests` parameters.

```yml
name: E2E
on: push
jobs:
  test:
    runs-on: ubuntu-16.04
    steps:
      - uses: actions/checkout@master
      - name: Install dependencies
        uses: cypress-io/github-action@v2
        with:
          # just perform install
          runTests: false
      - run: yarn lint
      - name: Run e2e tests
        uses: cypress-io/github-action@v2
        with:
          # we have already installed all dependencies above
          install: false
          # Cypress tests and config file are in "e2e" folder
          working-directory: e2e
```

See [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) for working example.

### Custom install

Finally, you might not need this GH Action at all. For example, if you want to split the NPM dependencies installation from the Cypress binary installation, then it makes no sense to use this action. Instead you can install and cache Cypress yourself. See [cypress-gh-action-split-install](https://github.com/bahmutov/cypress-gh-action-split-install) for working example.

### More examples

<!-- prettier-ignore-start -->
Name | Description
--- | ---
[cypress-gh-action-example](https://github.com/bahmutov/cypress-gh-action-example) | uses Yarn, and runs in parallel on several versions of Node, also different browsers
[cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) | splits install and running tests commands, runs Cypress from sub-folder
[cypress-gh-action-subfolders](https://github.com/bahmutov/cypress-gh-action-subfolders) | separate folder for Cypress dependencies
[cypress-gh-action-split-install](https://github.com/bahmutov/cypress-gh-action-split-install) | only install NPM dependencies, then install and cache Cypress binary yourself
[cypress-gh-action-vue-example](https://github.com/cypress-io/cypress-gh-action-vue-example) | project was scaffolded using Vue CLI
[gh-action-and-gh-integration](https://github.com/cypress-io/gh-action-and-gh-integration) | records to the dashboard and has [Cypress GH Integration](https://on.cypress.io/github-integration) app installed
<!-- prettier-ignore-end -->

## Notes

### Installation

This action installs local dependencies using lock files. If `yarn.lock` file is found, the install uses `yarn --frozen-lockfile` command. Otherwise it expects to find `package-lock.json` and install using `npm ci` command.

### Debugging

You can see verbose messages from GitHub Actions by setting the following secrets (from [Debugging Actions Guide](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#step-debug-logs))

```
ACTIONS_RUNNER_DEBUG: true
ACTIONS_STEP_DEBUG: true
```

## Development

Read [DEVELOPMENT.md](DEVELOPMENT.md)

## More information

- Read our blog post [Drastically Simplify Testing on CI with Cypress GitHub Action](https://www.cypress.io/blog/2019/11/20/drastically-simplify-your-testing-with-cypress-github-action/)
- [Building actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/building-actions) docs

## Extras

### Outputs

This GH Action sets an output `dashboardUrl` if the run was recorded on [Cypress Dashboard](https://on.cypress.io/dashboard-introduction), see [action.yml](action.yml). To use this output:

```yml
- name: Cypress tests
  uses: cypress-io/github-action@v2
  # let's give this action an ID so we can refer
  # to its output values later
  id: cypress
  # Continue the build in case of an error, as we need to set the
  # commit status in the next step, both in case of success and failure
  continue-on-error: true
  with:
    record: true
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.RECORDING_KEY }}
- name: Print Dashboard URL
  run: |
    echo Cypress finished with: ${{ steps.cypress.outcome }}
    echo See results at ${{ steps.cypress.outputs.dashboardUrl }}
```

[![recording example](https://github.com/cypress-io/github-action/workflows/example-recording/badge.svg?branch=master)](.github/workflows/example-recording.yml)

### Docker image

If your repository does not have `package.json` or `yarn.json` (maybe it contains a static site and does not need any dependencies), you can run Cypress tests using `cypress/included:...` [Cypress Docker images](https://github.com/cypress-io/cypress-docker-images/tree/master/included). In that case you don't even need this GH Action, instead use the Docker container and write `cypress run` command like this example from [cypress-gh-action-included](https://github.com/bahmutov/cypress-gh-action-included)

```yml
name: included
on: [push]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    # Docker image with Cypress pre-installed
    # https://github.com/cypress-io/cypress-docker-images/tree/master/included
    container: cypress/included:3.8.3
    steps:
      - uses: actions/checkout@v1
      - run: cypress run
```

## Migration guide

### v1 to v2

This is noted as a breaking change ... but you should not see any changes. We have changed how we run Cypress (from using the command line to using the [NPM module API](https://on.cypress.io/module-api)), which is a big change. But hopefully our examples are complete and we did not break anyone's code.

## License

[MIT License](./LICENSE.md)

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

# cypress-io/github-action [![Action status][ci-badge]][ci-workflow] [![cypress][cloud-badge]][cloud-project] [![renovate-app badge][renovate-badge]][renovate-bot]

 > [GitHub Action](https://docs.github.com/en/actions) for running [Cypress](https://www.cypress.io) end-to-end and component tests. Includes npm, pnpm and Yarn installation, custom caching and lots of configuration options.

## Examples

- [End-to-End](#end-to-end-testing) testing
- [Component](#component-testing) testing
- Select [action version](#action-version)
- Run tests in a given [browser](#browser)
  - using [Chrome](#chrome)
  - using [Firefox](#firefox)
  - using [Edge](#edge)
  - using [headed mode](#headed)
- Using [Docker image](#docker-image)
- Specify [environment variables](#env)
- Run only some [spec files](#specs)
- Test [project in subfolder](#project)
- [Record results](#record-test-results-on-cypress-cloud) on Cypress Cloud
- Tag [recordings](#tag-recordings)
- Specify [auto cancel](#specify-auto-cancel-after-failures) after failures
- Store [test artifacts](#artifacts) on GitHub
- [Quiet output](#quiet-flag)
- Set Cypress [config values](#config)
- Use specific [config file](#config-file)
- Run tests in [parallel](#parallel)
- Combine [Component and E2E](#component-and-e2e-testing) testing
- [Build app](#build-app) before running the tests
- [Start server](#start-server) before running the tests
- [Start multiple servers](#start-multiple-servers) before running the tests
- [Wait for server](#wait-on) to respond before running the tests
- [`wait-on` with Node.js 18+](#wait-on-with-nodejs-18) workarounds
- Use [custom install command](#custom-install-command)
- Use [command prefix](#command-prefix)
- Use [own custom test command](#custom-test-command)
- Pass [custom build id](#custom-build-id) when recording to Cypress Cloud
- Generate a [robust custom build id](#robust-custom-build-id) to allow re-running the workflow
- Use different [working-directory](#working-directory)
- Use [subfolders](#subfolders)
- Use [pnpm](#pnpm)
- Use [Yarn Classic](#yarn-classic)
- Use [Yarn Modern](#yarn-modern)
- Use [Yarn Plug'n'Play](#yarn-plugnplay)
- Use [Yarn workspaces](#yarn-workspaces)
- Use [custom cache key](#custom-cache-key)
- Run tests on multiple [Node versions](#node-versions)
- Split [install and tests](#split-install-and-tests) into separate jobs
- Use [custom install commands](#custom-install)
- Install [only Cypress](#install-cypress-only) to avoid installing all dependencies
- Use [timeouts](#timeouts) to avoid hanging CI jobs
- Print [Cypress info](#print-cypress-info) like detected browsers
- Run [tests nightly](#nightly-tests) or on any schedule
- Suppress [test summary](#suppress-test-summary)
- [More examples](#more-examples)

Current examples contained in this repository are based on Cypress 12.x and can be found in the [examples](./examples) directory. Examples for [Legacy Configuration](https://on.cypress.io/guides/references/legacy-configuration) use Cypress `9.7.0` and are kept in the [examples/v9](./examples/v9) directory.

Live examples, such as [example-basic.yml](.github/workflows/example-basic.yml) are shown together with a status badge. Click on the status badge to read the source code of the workflow, for example

[![End-to-End example](https://github.com/cypress-io/github-action/workflows/example-basic/badge.svg?branch=master)](.github/workflows/example-basic.yml)

Some older **external** examples, linked to by this document, are based solely on Cypress 9 and below and therefore use a [Legacy Configuration](https://on.cypress.io/guides/references/legacy-configuration). These may need modification to be applied to Cypress 10 and later. Each of these external links is listed with a `(legacy)` notation.

**Note:** this package assumes that [cypress](https://www.npmjs.com/package/cypress) is declared as a development dependency in the [package.json](https://docs.npmjs.com/creating-a-package-json-file) file. The [cypress npm module](https://www.npmjs.com/package/cypress) is required to run Cypress via its [Module API](https://on.cypress.io/module-api).

### End-to-End Testing

```yml
name: End-to-end tests
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      # Install npm dependencies, cache them correctly
      # and run all Cypress tests
      - name: Cypress run
        uses: cypress-io/github-action@v5
```

[![End-to-End example](https://github.com/cypress-io/github-action/workflows/example-basic/badge.svg?branch=master)](.github/workflows/example-basic.yml)

The workflow file [example-basic.yml](.github/workflows/example-basic.yml) shows how Cypress runs on GH Actions using Ubuntu (20 and 22), Windows, and macOS without additional OS dependencies necessary.

This workflow uses the default [test type](https://on.cypress.io/guides/overview/why-cypress#Test-types) of [End-to-End (E2E) Testing](https://on.cypress.io/guides/overview/why-cypress#End-to-end). Alternatively, [Component Testing](https://on.cypress.io/guides/overview/why-cypress#Component) can be utilized by referencing the [Component Testing](#component-testing) section below.

### Component Testing

To use [Cypress Component Testing](https://on.cypress.io/component-testing) add `component: true`

```yml
name: End-to-end tests
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          component: true
```

[![Component Testing example](https://github.com/cypress-io/github-action/workflows/example-component-test/badge.svg?branch=master)](.github/workflows/example-component-test.yml)

See the example project [component-tests](examples/component-tests/) and the [example-component-test.yml](.github/workflows/example-component-test.yml) workflow for more details.

### Action version

**Best practice:**

Our examples specify using branch [v5](https://github.com/cypress-io/github-action/tree/v5) which is the action's latest major version:

```yml
- name: Cypress run
  uses: cypress-io/github-action@v5
```

When using `cypress-io/github-action@v5` from your workflow file, you will automatically use the latest [tag](https://github.com/cypress-io/github-action/tags) from branch [v5](https://github.com/cypress-io/github-action/tree/v5).

Alternatively, to mitigate unforeseen breaks, bind to a specific [tag](https://github.com/cypress-io/github-action/tags), for example:

```yml
- name: Cypress run
  uses: cypress-io/github-action@v5.1.0
```

The changes associated with each tag are shown under GitHub's [releases](https://github.com/cypress-io/github-action/releases) list. Refer also to the [Changelog](#changelog) for an overview of major changes.

### Browser

Specify the browser name or path with the `browser` parameter. The default browser, if none is specified, is the built-in [Electron browser](https://on.cypress.io/guides/guides/launching-browsers#Electron-Browser).

### Chrome

```yml
name: Chrome
on: push
jobs:
  chrome:
    runs-on: ubuntu-22.04
    name: E2E on Chrome
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          browser: chrome
```

[![Chrome example](https://github.com/cypress-io/github-action/workflows/example-chrome/badge.svg?branch=master)](.github/workflows/example-chrome.yml)

### Firefox

```yml
name: Firefox
on: push
jobs:
  firefox:
    runs-on: ubuntu-22.04
    name: E2E on Firefox
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          browser: firefox
```

[![Firefox example](https://github.com/cypress-io/github-action/workflows/example-firefox/badge.svg?branch=master)](.github/workflows/example-firefox.yml)

### Edge

```yml
name: Edge
on: push
jobs:
  edge:
    runs-on: ubuntu-22.04
    name: E2E on Edge
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          browser: edge
```

[![Edge example](https://github.com/cypress-io/github-action/workflows/example-edge/badge.svg?branch=master)](.github/workflows/example-edge.yml)

### Headed

Run the browser in headed mode - as of Cypress v8.0 the `cypress run` command executes tests in `headless` mode by default

```yml
name: Chrome headed
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          browser: chrome
          headed: true
```

### Docker image

You can run tests in a GH Action in your Docker container.

```yml
name: E2E in custom container
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    # Cypress Docker image with Chrome v106
    # and Firefox v106 pre-installed
    container: cypress/browsers:node18.12.0-chrome106-ff106
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          browser: chrome
```

### Env

Specify the env argument with `env` parameter

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run with env
        uses: cypress-io/github-action@v5
        with:
          env: host=api.dev.local,port=4222
```

When passing the environment variables this way, unfortunately due to GitHub Actions syntax, the variables should be listed in a single line, which can be hard to read. As an alternative, you can use the step's `env` block where every variable can be set on its own line. In this case, you should prefix every variable with `CYPRESS_` because such variables [are loaded by Cypress automatically](https://on.cypress.io/environment-variables). The above code example is equivalent to:

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run with env
        uses: cypress-io/github-action@v5
        env:
          CYPRESS_host: api.dev.local
          CYPRESS_port: 4222
```

For more examples, see the workflows below, using environment variables for [recording](#record-test-results-on-cypress-cloud).

[![Env example](https://github.com/cypress-io/github-action/workflows/example-env/badge.svg?branch=master)](.github/workflows/example-env.yml)

### Specs

Specify the [spec files to run](https://docs.cypress.io/guides/guides/command-line.html#cypress-run-spec-lt-spec-gt) with `spec` parameter

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          spec: cypress/e2e/spec1.cy.js
```

You can pass multiple specs and wild card patterns using multi-line parameter, see [example-config.yml](.github/workflows/example-config.yml):

```yml
spec: |
  cypress/e2e/spec-a.cy.js
  cypress/**/*-b.cy.js
```

For more information, visit [the Cypress command-line docs](https://on.cypress.io/command-line#cypress-run-env-lt-env-gt).

### Project

Specify the [project to run](https://docs.cypress.io/guides/guides/command-line.html#cypress-run-project-lt-project-path-gt) with `project` parameter

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          project: ./some/nested/folder
```

For more information, visit [the Cypress command-line docs](https://on.cypress.io/command-line#cypress-run-project-lt-project-path-gt).

### Record test results on Cypress Cloud

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          record: true
        env:
          # pass the Cypress Cloud record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          # pass GitHub token to allow accurately detecting a build vs a re-run build
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

[![recording example](https://github.com/cypress-io/github-action/workflows/example-recording/badge.svg?branch=master)](.github/workflows/example-recording.yml)

**Tip 1:** We recommend using the action with `on: push` instead of `on: pull_request` to get the most accurate information related to the commit on Cypress Cloud. With pull requests, the merge commit is created automatically and might not correspond to a meaningful commit in the repository.

**Tip 2:** we recommend passing the `GITHUB_TOKEN` secret (created by the GH Action automatically) as an environment variable. This will allow correctly identifying every build and avoid confusion when re-running a build.

**Tip 3:** if running on `pull_request` event, the commit message is "merge SHA into SHA", which is not what you want probably. You can overwrite the commit message sent to Cypress Cloud by setting an environment variable. See [issue 124](https://github.com/cypress-io/github-action/issues/124#issuecomment-653180260) for details.

**Tip 4:** to record the project needs `projectId`. Typically this value is saved in the [Cypress Configuration File](https://docs.cypress.io/guides/references/configuration#Configuration-File). If you want to avoid this, pass the `projectId` using an environment variable:

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          record: true
        env:
          # pass the Cypress Cloud record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          # pass GitHub token to allow accurately detecting a build vs a re-run build
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # pass the project ID from the secrets through environment variable
          CYPRESS_PROJECT_ID: ${{ secrets.PROJECT_ID }}
```

### Tag recordings

You can pass a single or multiple tags when recording a run. For example

```yml
name: tags
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    # let's make sure our "app" works on several versions of Node
    strategy:
      matrix:
        node: [16, 18, 20]
    name: E2E on Node v${{ matrix.node }}
    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - run: node -v

      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          record: true
          tag: node-${{ matrix.node }}
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The recording will have tags as labels on the run.

![Tags](images/tags.png)

You can pass multiple tags using commas like `tag: node-18,nightly,staging`.

### Specify auto cancel after failures

Specify the number of failed tests that will cancel a run when using the [Cypress Cloud Auto Cancellation](https://docs.cypress.io/guides/cloud/smart-orchestration#Auto-Cancellation) feature.

This feature requires Cypress 12.6.0 or later and a [Cypress Cloud Business or Enterprise](https://www.cypress.io/cloud/) account.

```yml
name: Cypress E2E Tests
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    name: E2E
    steps:
      - name: Setup Node
        uses: actions/setup-node@v3

      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          record: true
          # Cancel the run after 2 failed tests
          auto-cancel-after-failures: 2
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

See [Auto Cancellation](https://docs.cypress.io/guides/cloud/smart-orchestration#Auto-Cancellation) for more information.

### Artifacts

If you don't record the test run on Cypress Cloud, you can still store generated videos and screenshots as CI artifacts. See the workflow example below.

```yml
name: Artifacts
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    name: Artifacts
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
      # after the test run completes store videos and any screenshots
      - uses: actions/upload-artifact@v3
        # add the line below to store screenshots only on failures
        # if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
          if-no-files-found: ignore # 'warn' or 'error' are also available, defaults to `warn`
      - uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: cypress/videos
          if-no-files-found: ignore # 'warn' or 'error' are also available, defaults to `warn`
```

### Quiet flag

You can provide `quiet` flag for cypress run to silence any Cypress specific output from stdout

```yml
name: example-quiet
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      # Install npm dependencies, cache them correctly
      # and run all Cypress tests with `quiet` parameter
      - name: Cypress run
        uses: ./
        with:
          working-directory: examples/quiet
          quiet: true
```

[![example-quiet](https://github.com/cypress-io/github-action/workflows/example-quiet/badge.svg?branch=master)](.github/workflows/example-quiet.yml)

### Config

Specify [configuration](https://docs.cypress.io/guides/references/configuration.html) values with `config` parameter

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          config: pageLoadTimeout=100000,baseUrl=http://localhost:3000
```

[![example-config](https://github.com/cypress-io/github-action/workflows/example-config/badge.svg?branch=master)](.github/workflows/example-config.yml)

### Config File

Specify the path to your config file with `config-file` parameter

```yml
name: Cypress tests
on: push
jobs:
  cypress-run:
    name: Cypress run
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          config-file: tests/cypress-config.json
```

### Parallel

**Note:** Cypress parallelization requires a [Cypress Cloud](https://on.cypress.io/cloud-introduction) account.

You can spin multiple containers running in parallel using `strategy: matrix` argument. Just add more dummy items to the `containers: [1, 2, ...]` array to spin more free or paid containers. Then use `record` and `parallel` parameters to [load balance tests](https://on.cypress.io/parallelization).

```yml
name: Parallel Cypress Tests
on: push
jobs:
  test:
    name: Cypress run
    runs-on: ubuntu-22.04
    strategy:
      # when one test fails, DO NOT cancel the other
      # containers, because this will kill Cypress processes
      # leaving Cypress Cloud hanging ...
      # https://github.com/cypress-io/github-action/issues/48
      fail-fast: false
      matrix:
        # run 3 copies of the current job in parallel
        containers: [1, 2, 3]
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      # because of "record" and "parallel" parameters
      # these containers will load balance all found tests among themselves
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          record: true
          parallel: true
          group: 'Actions example'
        env:
          # pass the Cypress Cloud record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          # Recommended: pass the GitHub token lets this action correctly
          # determine the unique run id necessary to re-run the checks
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

![Parallel run](images/parallel.png)

**Warning ⚠️:** Cypress actions use `GITHUB_TOKEN` to get the correct branch and the number of jobs run, making it possible to re-run without the need of pushing an empty commit. If you don't want to use the `GITHUB_TOKEN` you can still run your tests without problem with the only note that Cypress Cloud's API connects parallel jobs into a single logical run using GitHub commit SHA plus workflow name. If you attempt to re-run GitHub checks, Cypress Cloud thinks the run has already ended. In order to truly rerun parallel jobs, push an empty commit with `git commit --allow-empty -m "re-run checks" && git push`. As another work around you can generate and cache a custom build id, read [Adding a unique build number to GitHub Actions](https://medium.com/attest-engineering/adding-a-unique-github-build-identifier-7aa2e83cadca).

The Cypress GH Action does not spawn or create any additional containers - it only links the multiple containers spawned using the matrix strategy into a single logical Cypress Cloud run where it splits the specs amongst the machines. See the [Cypress parallelization](https://on.cypress.io/parallelization) guide for the explanation.

During staged rollout of a new GitHub-hosted runner version, GitHub may provide a mixture of current and new image versions used by the container matrix. It is recommended to use a [Docker image](#docker-image) in the parallel job run which avoids any Cypress Cloud errors due to browser major version mismatch from the two different image versions. A [Docker image](#docker-image) is not necessary if testing against the default built-in Electron browser because this browser version is fixed by the Cypress version in use and it is unaffected by any GitHub runner image rollout.

### Component and E2E Testing

[Component Testing](https://on.cypress.io/guides/overview/why-cypress#Component) and [End-to-End (E2E) Testing](https://on.cypress.io/guides/overview/why-cypress#End-to-end) types can be combined in the same job using separate steps

```yml
- name: Run E2E tests
  uses: cypress-io/github-action@v5

- name: Run Component Testing
  uses: cypress-io/github-action@v5
  with:
    # we have already installed everything
    install: false
    component: true
```

See the example project [component-test](examples/component-tests/) and the [example-component-test.yml](.github/workflows/example-component-test.yml) workflow for more details.

### Build app

You can run a build step before starting tests

```yml
name: Build
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
```

### Start server

If your tests run against a local server, use the `start` parameter to start your server. The server will run in the background.

```yml
name: With server
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          start: npm start
```

**Note:** sometimes on Windows you need to run a different start command. You can use the `start-windows` parameter for this.

```yml
name: With server
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          # Linux and MacOS
          start: npm start
          # Takes precedences on Windows
          start-windows: npm run start:windows:server
```

[![start example](https://github.com/cypress-io/github-action/workflows/example-start/badge.svg?branch=master)](.github/workflows/example-start.yml)

**Note:** A server continues to run until the end of the GitHub workflow job that started it. At the end of the job the GitHub workflow runner executes a "Complete job" phase automatically where it terminates any server processes which are still running.

### Start multiple servers

You can start multiple server processes. For example, if you have an API to start using `npm run api` and the web server to start using `npm run web` you can put those commands in `start` using comma separation.

```yml
name: With servers
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          start: npm run api, npm run web
```

You can place the start commands in separate lines

```yml
with:
  start: |
    npm run api
    npm run web
```

[![start example](https://github.com/cypress-io/github-action/workflows/example-start/badge.svg?branch=master)](.github/workflows/example-start.yml)

### Wait-on

If you are starting a local server and it takes a while to start, you can add a parameter `wait-on` and pass url to wait for the server to respond.

```yml
name: After server responds
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          start: npm start
          # quote the url to be safe against YML parsing surprises
          wait-on: 'http://localhost:8080'
```

[![wait-on example](https://github.com/cypress-io/github-action/workflows/example-wait-on/badge.svg?branch=master)](.github/workflows/example-wait-on.yml)

[![Webpack Dev Server example](https://github.com/cypress-io/github-action/workflows/example-webpack/badge.svg?branch=master)](.github/workflows/example-webpack.yml) (also uses `wait-on`)

By default, `wait-on` will retry for 60 seconds. You can pass a custom timeout in seconds using `wait-on-timeout`.

```yml
- uses: cypress-io/github-action@v5
  with:
    start: npm start
    wait-on: 'http://localhost:8080/status'
    # wait for 2 minutes for the server to respond
    wait-on-timeout: 120
```



You can wait for multiple URLs to respond by separating urls with a comma

```yml
- uses: cypress-io/github-action@v5
  with:
    # API runs on port 3050
    # Web server runs on port 8080
    start: npm run api, npm run web
    # wait for all services to respond
    wait-on: 'http://localhost:3050, http://localhost:8080'
```

The action will wait for the first url to respond, then will check the second url, and so on.

You can even use your own command (usually by using `npm`, `yarn`, `npx`) to wait for the server to respond. For example, if you want to use the [wait-on](https://github.com/jeffbski/wait-on) utility to ping the server and run the Cypress tests after the server responds:

```yml
- uses: cypress-io/github-action@v5
  with:
    start: npm start
    wait-on: 'npx wait-on --timeout 60000 http://localhost:3000'
```

See [example-wait-on.yml](.github/workflows/example-wait-on.yml) workflow file.

If this action times out waiting for the server to respond, please see [Debugging](#debugging) section in this README file.

#### `wait-on` with Node.js 18+

Under Node.js version 18 and later, `wait-on` may fail to recognize that a `localhost` server is running. This affects development web servers which do not listen on both IPv4 and IPv6 network stacks.

- Check your server documentation to see if it can be started using `0.0.0.0` (all addresses) and use this if available. If this option is not available or does not resolve the issue then carry on to the next steps:
- If the action log shows that `wait-on` is failing to connect to `127.0.0.1`, replace `localhost` by `[::1]` (the IPv6 loopback address)
- If the action log shows that `wait-on` is failing to connect to `::1`, replace `localhost` by `127.0.0.1` (the IPv4 loopback address)

### Custom install command

If you want to overwrite the install command

```yml
- uses: cypress-io/github-action@v5
  with:
    install-command: yarn --frozen-lockfile --silent
```

See [example-install-command.yml](.github/workflows/example-install-command.yml) workflow file.

### Command prefix

You can prefix the default test command using the `command-prefix` option. This is useful for example when running [Percy](https://docs.percy.io/docs/cypress), which requires the test command to be wrapped with `percy exec --`.

```yml
name: Visual
on: push
jobs:
  e2e:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          start: npm start
          # quote the url to be safe against YML parsing surprises
          wait-on: 'http://localhost:8080'
          # the entire command will automatically be prefixed with "npm"
          # and we need the second "npm" to execute "cypress run ..." command line
          command-prefix: 'percy exec -- npx'
```

### Custom test command

You can overwrite the Cypress run command with your own command.

```yml
steps:
  - name: Checkout 🛎
    uses: actions/checkout@v3

  - name: Custom tests 🧪
    uses: cypress-io/github-action@v5
    with:
      command: npm run e2e:ci
```

**Caution**: using the action parameter `command` causes multiple other parameters to be ignored including: `auto-cancel-after-failures`, `browser`, `ci-build-id`, `command-prefix`, `component`, `config`, `config-file`, `env`, `group`, `headed`, `parallel`, `project`, `publish-summary`, `quiet`, `record`, `spec` and `tag`.

See [example-custom-command.yml](.github/workflows/example-custom-command.yml) file.

### Custom build id

You can overwrite [`ci-build-id`](https://on.cypress.io/parallelization#Linking-CI-machines-for-parallelization-or-grouping) used to link separate machines running tests into a single parallel run.

```yml
name: Parallel
on: push
jobs:
  test:
    runs-on: ubuntu-22.04
    strategy:
      matrix:
        # run 3 copies of the current job in parallel
        containers: [1, 2, 3]
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          record: true
          parallel: true
          group: 'Actions example'
          ci-build-id: '${{ github.sha }}-${{ github.workflow }}-${{ github.event_name }}'
        env:
          # pass the Cypress Cloud record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Tip:** see [Learn GitHub Actions](https://docs.github.com/en/actions/learn-github-actions), with sections on Expressions, Contexts and Environment variables.

### Robust custom build id

If you re-run the GitHub workflow, if you use the same custom build id during recording, Cypress Cloud will cancel the run with "Build already finished" error. To avoid this, you need to generate a _new_ custom build id on every workflow re-run. A good solution showing in the [example-custom-ci-build-id.yml](.github/workflows/example-custom-ci-build-id.yml) file is to run a common job first that just generates a new random ID. This ID can be used by the testing jobs to tie the build together. If the user re-runs the workflow a new unique build id is generated, allowing recording the new Cypress Cloud run.

```yml
jobs:
  # single job that generates and outputs a common id
  prepare:
    outputs:
      uuid: ${{ steps.uuid.outputs.value }}
    steps:
      - name: Generate unique ID 💎
        id: uuid
        # take the current commit + timestamp together
        # the typical value would be something like
        # "sha-5d3fe...35d3-time-1620841214"
        run: echo "value=sha-$GITHUB_SHA-time-$(date +"%s")" >> $GITHUB_OUTPUT
  smoke-tests:
    needs: ['prepare']
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          record: true
          parallel: true
          ci-build-id: ${{ needs.prepare.outputs.uuid }}
        env:
          # pass the Cypress Cloud record key as an environment variable
          CYPRESS_RECORD_KEY: ${{ secrets.EXAMPLE_RECORDING_KEY }}
```

See the [example-custom-ci-build-id.yml](.github/workflows/example-custom-ci-build-id.yml) for the full workflow.

### Working directory

In a monorepo, the end-to-end or component test might be placed in a different sub-folder from the application itself.

Using a [Cypress legacy configuration](https://docs.cypress.io/guides/references/legacy-configuration) (Version 9 or earlier) the structure could look like this:

```text
repo/
  app/
  app-test/
    cypress/
      fixtures/
      integration/
      plugins/
      support/
    cypress.json
  package.json
```

For End-to-End testing using a [Cypress configuration](https://docs.cypress.io/guides/references/configuration) for Version 10 and later, the structure could look like this :

```text
repo/
  app/
  app-test/
    cypress/
      e2e/
      fixtures/
      support/
    cypress.config.js
  package.json
```

Similarly for Component Testing with a [Cypress configuration](https://docs.cypress.io/guides/references/configuration) for Version 10 and later, the structure could look like this:

```text
repo/
  app/
  app-test/
    cypress/
      component/
      fixtures/
      support/
    cypress.config.js
  package.json
```

You can specify the `app-test` working directory when running Cypress tests using the `working-directory` parameter

```yml
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          start: npm start
          working-directory: app-test
```

See [example-basic.yml](.github/workflows/example-basic.yml) for an End-to-End test example and [example-component-test.yml](.github/workflows/example-component-test.yml) for a Component test example, using the parameter `working-directory`.

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
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@master
      - name: Install root dependencies
        uses: bahmutov/npm-install@v1

      - name: Start server in the background
        run: npm start &

      # Cypress has its own package.json in folder "e2e"
      - name: Install Cypress and run tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: e2e
```

See [cypress-gh-action-subfolders](https://github.com/bahmutov/cypress-gh-action-subfolders) (legacy) for example.

### pnpm

The package manager `pnpm` is not pre-installed in [GitHub Actions runner images](https://github.com/actions/runner-images) (unlike `npm` and `yarn`): to install `pnpm` include [pnpm/action-setup](https://github.com/pnpm/action-setup) in your workflow. If the action finds a `pnpm-lock.yaml` file, it uses the [pnpm](https://pnpm.io/cli/install) command `pnpm install --frozen-lockfile` by default to install dependencies.

```yaml
name: example-basic-pnpm
on: push
jobs:
  basic-pnpm:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 7
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          working-directory: examples/basic-pnpm
```

[![pnpm example](https://github.com/cypress-io/github-action/workflows/example-basic-pnpm/badge.svg?branch=master)](.github/workflows/example-basic-pnpm.yml)

### Yarn Classic

If a `yarn.lock` file is found, the action uses the [Yarn 1 (Classic)](https://classic.yarnpkg.com/) command `yarn --frozen-lockfile` by default to install dependencies.

```yaml
name: example-yarn-classic
on: push
jobs:
  yarn-classic:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          working-directory: examples/yarn-classic
```

[![Yarn classic example](https://github.com/cypress-io/github-action/workflows/example-yarn-classic/badge.svg?branch=master)](.github/workflows/example-yarn-classic.yml)

### Yarn Modern

To install dependencies using a `yarn.lock` file from [Yarn Modern](https://yarnpkg.com/) (Yarn 2 and later) you need to override the default [Yarn 1 (Classic)](https://classic.yarnpkg.com/) installation command `yarn --frozen-lockfile`. You can do this by using the `install-command` parameter and specifying `yarn install` for example:

```yaml
name: example-yarn-modern
on: push
jobs:
  yarn-classic:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          working-directory: examples/yarn-modern
          install-command: yarn install
```

[![Yarn Modern example](https://github.com/cypress-io/github-action/workflows/example-yarn-modern/badge.svg?branch=master)](.github/workflows/example-yarn-modern.yml)

### Yarn Plug'n'Play

When using [Yarn Modern](https://yarnpkg.com/) (Yarn 2 and later) with [Plug'n'Play](https://yarnpkg.com/features/pnp) enabled, you will need to use the `command` parameter to run `yarn` instead of [npx](https://docs.npmjs.com/cli/v9/commands/npx).

```yaml
name: example-yarn-modern-pnp
on: push
jobs:
  yarn-classic:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          working-directory: examples/yarn-modern-pnp
          install-command: yarn install
          command: yarn cypress run
```

[![Yarn Plug'n'Play example](https://github.com/cypress-io/github-action/actions/workflows/example-yarn-modern-pnp.yml/badge.svg?branch=master)](https://github.com/cypress-io/github-action/actions/workflows/example-yarn-modern-pnp.yml)

**Caution**: using the action parameter `command` causes multiple other parameters to be ignored. [See `command` section for more information.](#custom-test-command)

### Yarn workspaces

This action should discover the Yarn workspaces correctly. For example, see folder [examples/start-and-yarn-workspaces](examples/start-and-yarn-workspaces) and workflow file [example-start-and-yarn-workspaces.yml](.github/workflows/example-start-and-yarn-workspaces.yml)

```yaml
name: example-start-and-yarn-workspaces
on: push
jobs:
  single:
    # the example has Yarn workspace in its "root" folder
    # examples/start-and-yarn-workspaces
    # and tests in a subfolder like "workspace-1"
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
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
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    # let's make sure our "app" works on several versions of Node
    strategy:
      matrix:
        node: [16, 18, 20]
    name: E2E on Node v${{ matrix.node }}
    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - name: Checkout
        uses: actions/checkout@v3
      # run Cypress tests and record them under the same run
      # associated with commit SHA and just give a different group name
      - name: Cypress run
        uses: cypress-io/github-action@v5
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
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    strategy:
      matrix:
        node: [16, 18, 20]
    name: E2E on Node v${{ matrix.node }}
    steps:
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
```

[![Node versions example](https://github.com/cypress-io/github-action/workflows/example-node-versions/badge.svg?branch=master)](.github/workflows/example-node-versions.yml)

### Split install and tests

Sometimes you may want to run additional commands between installation and tests. To enable this use the `install` and `runTests` parameters.

```yml
name: E2E
on: push
jobs:
  test:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@master
      - name: Install dependencies
        uses: cypress-io/github-action@v5
        with:
          # just perform install
          runTests: false
      - run: yarn lint
      - name: Run e2e tests
        uses: cypress-io/github-action@v5
        with:
          # we have already installed all dependencies above
          install: false
          # Cypress tests and config file are in "e2e" folder
          working-directory: e2e
```

See [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo) for a working example.

### Custom install

Finally, you might not need this GH Action at all. For example, if you want to split the npm dependencies installation from the Cypress binary installation, then it makes no sense to use this action. Instead you can install and cache Cypress yourself. See [cypress-gh-action-split-install](https://github.com/bahmutov/cypress-gh-action-split-install) (legacy) for a working example.

### Install Cypress only

If the project has many dependencies, but you want to install just Cypress you can combine this action with `actions/cache` and `npm i cypress` commands yourself.

```yml
- uses: actions/checkout@v3
- uses: actions/cache@v2
  with:
    path: |
      ~/.cache/Cypress
      node_modules
    key: my-cache-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
- run: npm i cypress
- uses: cypress-io/github-action@v5
  with:
    install: false
```

[![Install only Cypress example](https://github.com/cypress-io/github-action/workflows/example-install-only/badge.svg?branch=master)](.github/workflows/example-install-only.yml)

### Timeouts

You can tell the CI to stop the job or the individual step if it runs for longer then a given time limit. This is a good practice to ensure the hanging process does not accidentally use up all your CI minutes.

```yml
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    # stop the job if it runs over 10 minutes
    # to prevent a hanging process from using all your CI minutes
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        # you can specify individual step timeout too
        timeout-minutes: 5
```

See [cypress-gh-action-example](https://github.com/bahmutov/cypress-gh-action-example) (legacy).

### More examples

<!-- prettier-ignore-start -->
| Name                                                                                                    | Description                                                                               |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [cypress-io/cypress-example-kitchensink](https://github.com/cypress-io/cypress-example-kitchensink)     | Runs every API command in Cypress using various CI platforms including GitHub Actions     |
| [cypress-io/cypress-realworld-app](https://github.com/cypress-io/cypress-realworld-app)                 | A real-world example payment application. Uses GitHub Actions and CircleCI.               |
| [cypress-gh-action-small-example](https://github.com/bahmutov/cypress-gh-action-small-example) (legacy) | Runs tests and records them on Cypress Cloud                                              |
| [cypress-gh-action-example](https://github.com/bahmutov/cypress-gh-action-example)  (legacy)            | Uses Yarn, and runs in parallel on several versions of Node, different browsers, and more |
| [cypress-gh-action-monorepo](https://github.com/bahmutov/cypress-gh-action-monorepo)                    | Splits install and running tests commands, runs Cypress from sub-folder                   |
| [cypress-gh-action-subfolders](https://github.com/bahmutov/cypress-gh-action-subfolders) (legacy)       | Has separate folder for Cypress dependencies                                              |
| [cypress-gh-action-split-install](https://github.com/bahmutov/cypress-gh-action-split-install) (legacy) | Only install npm dependencies, then install and cache Cypress binary yourself             |
| [cypress-gh-action-changed-files](https://github.com/bahmutov/cypress-gh-action-changed-files) (legacy) | Shows how to run different Cypress projects depending on changed files                    |
| [cypress-examples](https://github.com/bahmutov/cypress-examples)                                        | Shows separate install job from parallel test jobs                                        |
| [cypress-gh-action-split-jobs](https://github.com/bahmutov/cypress-gh-action-split-jobs)                | Shows a separate install job with the build step, and another job that runs the tests     |
<!-- prettier-ignore-end -->

## Notes

### Installation

This action installs local dependencies using lock files. Ensure that exactly one type of lock file is used for each project or working-directory from the following supported package managers:

 | Lock file           | Package Manager                                                                                  | Installation command             |
 | ------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
 | `package-lock.json` | [npm](https://docs.npmjs.com/cli/v9/commands/npm-ci)                                             | `npm ci`                         |
 | `pnpm-lock.yaml`    | [pnpm](https://pnpm.io/cli/install#--frozen-lockfile)                                            | `pnpm install --frozen-lockfile` |
 | `yarn.lock`         | [Yarn Classic](https://classic.yarnpkg.com/en/docs/cli/install#toc-yarn-install-frozen-lockfile) | `yarn --frozen-lockfile`         |

See section [Yarn Modern](#yarn-modern) for information about using Yarn version 2 and later.

## Debugging

This action uses the [debug](https://github.com/visionmedia/debug#readme) module to output additional verbose logs. You can see these debug messages by setting the following environment variable:

```
DEBUG: @cypress/github-action
```

You can set the environment variable using GitHub UI interface, or in the workflow file:

```yml
- name: Cypress tests with debug logs
  uses: cypress-io/github-action@v5
  env:
    DEBUG: '@cypress/github-action'
```

See the [example-debug.yml](.github/workflows/example-debug.yml) workflow file.

### Logs from the test runner

The above `ACTIONS_STEP_DEBUG` setting enables the debug logs from the action itself. To see the [Cypress debug logs](http://on.cypress.io/troubleshooting#Print-DEBUG-logs) add an environment variable to the action:

```yml
- name: Cypress tests with debug logs
  uses: cypress-io/github-action@v5
  env:
    DEBUG: 'cypress:*'
```

### Debugging waiting for URL to respond

If you have a problem with `wait-on` not working, you can check the [src/ping.js](src/ping.js) logic from the local machine.

- clone this repository to the local machine
- install dependencies with `npm install`
- start your server
- from another terminal call the `ping` yourself to validate the server is responding:

```
$ node src/ping-cli.js <url>
```

For example

```
$ node src/ping-cli.js https://example.cypress.io
pinging url https://example.cypress.io for 30 seconds
::debug::pinging https://example.cypress.io has finished ok
```

## More information

- Read our blog post [Drastically Simplify Testing on CI with Cypress GitHub Action](https://www.cypress.io/blog/2019/11/20/drastically-simplify-your-testing-with-cypress-github-action/)
- Read [Test the Preview Vercel Deploys](https://glebbahmutov.com/blog/develop-preview-test/) blog post
- [Creating actions](https://docs.github.com/en/actions/creating-actions) docs
- practice using the Cypress GitHub Action by following the [Cypress on CI Workshop](https://github.com/cypress-io/cypress-workshop-ci)

## Extras

### Manual trigger

If you add `workflow_dispatch` event to your workflow, you will be able to start the workflow by clicking a button on the GitHub page, see the [Test External Site Using GitHub Actions](https://www.youtube.com/watch?v=4TeSOj2Iy_Q) video.

### Outputs

This action sets a GitHub step output `resultsUrl` if the run was recorded on [Cypress Cloud](https://on.cypress.io/cloud-introduction) using the action parameter setting `record: true` (see [Record test results on Cypress Cloud](#record-test-results-on-cypress-cloud)). Note that using a [Custom test command](#custom-test-command) with the `command` parameter overrides the `record` parameter and in this case no `resultsUrl` step output is saved.

This is an example of using the step output `resultsUrl`:

```yml
- name: Cypress tests
  uses: cypress-io/github-action@v5
  # let's give this action an ID so we can refer
  # to its output values later
  id: cypress
  # Continue the build in case of an error, as we need to set the
  # commit status in the next step, both in case of success or failure
  continue-on-error: true
  with:
    record: true
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.RECORDING_KEY }}
- name: Print Cypress Cloud URL
  run: |
    echo Cypress finished with: ${{ steps.cypress.outcome }}
    echo See results at ${{ steps.cypress.outputs.resultsUrl }}
```

The GitHub step output `dashboardUrl` is deprecated. Cypress Dashboard is now [Cypress Cloud](https://on.cypress.io/cloud-introduction).

[![recording example](https://github.com/cypress-io/github-action/workflows/example-recording/badge.svg?branch=master)](.github/workflows/example-recording.yml)

**Note:** every GitHub workflow step can have `outcome` and `conclusion` properties. See the GitHub [Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts) documentation section [steps context](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#steps-context). In particular, the `outcome` or `conclusion` value can be `success`, `failure`, `cancelled`, or `skipped` which you can use in any following steps.

### Print Cypress info

Sometimes you might want to print Cypress and OS information, like the list of detected browsers. You can use the [`cypress info`](https://on.cypress.io/command-line#cypress-info) command for this.

If you are NOT using the `build` command in your project, you can run the `cypress info` command:

```yml
name: info
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npx cypress info
```

If you are already using the `build` parameter, you can split the [installation and the test steps](#split-install-and-tests) and insert the `cypress info` command in between:

```yml
name: info
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress install
        uses: cypress-io/github-action@v5
        with:
          # just perform install
          runTests: false
      - name: Cypress info
        run: npx cypress info
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          # we have already installed all dependencies above
          install: false
          # rest of your parameters
```

### Nightly tests

Sometimes you want to execute the workflow on a schedule. For example, to run Cypress tests nightly, you can schedule the workflow using `cron` syntax:

```yml
name: example-cron
on:
  schedule:
    # runs tests every day at 4am
    - cron: '0 4 * * *'
jobs:
  nightly:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress nightly tests 🌃
        uses: cypress-io/github-action@v5
```

[![cron example](https://github.com/cypress-io/github-action/workflows/example-cron/badge.svg?branch=master)](.github/workflows/example-cron.yml)

### Suppress test summary

The default test summary can be suppressed by using the parameter `publish-summary` and setting its value to `false`.
Sometimes users want to publish test summary using a specific action.
For example, a user running Cypress tests using a matrix and wants to retrieve the test summary for each matrix job and use a specific action that merges reports.

```yml
name: Example no summary
on: push
jobs:
  cypress-run:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          publish-summary: false
```

## Node.js Support

Node.js is required to run this action. The current version `v5` supports:

- **Node.js** 16.x
- **Node.js** 18.x
- **Node.js** 20.x and above

and is generally aligned with [Node.js's release schedule](https://github.com/nodejs/Release).

## Changelog

See [Releases](https://github.com/cypress-io/github-action/releases) for full details of changes.

| Version | Changes                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| v5.8.1  | Examples remove Node.js 19. End of support for Node.js 19.                                                                           |
| v5.6.2  | Examples add Node.js 20. End of support and removal of Node.js 14 examples.                                                          |
| v5.2.0  | Examples add Node.js 19.                                                                                                             |
| v5.0.0  | Examples add Node.js 18 and remove Node.js 12.                                                                                       |
| v4.2.2  | Dependency on GitHub `set-output` workflow command removed.                                                                          |
| v4.2.0  | Support for `pnpm` added.                                                                                                            |
| v4.0.0  | Support for Cypress 10 and later versions added.                                                                                     |
| v3      | Action runs under Node.js 16 instead of Node.js 12.                                                                                  |
| v2      | Cypress runs using the [Module API](https://docs.cypress.io/guides/guides/module-api) instead of being started via the command line. |
| v1      | *This version is no longer runnable in GitHub due to security changes.*                                                              |

*Note: [GitHub announced](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/) their plan to disable `save-state` and `set-output` commands. This will prevent [cypress-io/github-action](https://github.com/cypress-io/github-action) version [v4.2.1](https://github.com/cypress-io/github-action/releases/tag/v4.2.1) and earlier from running, since they use `set-output`. Affected users should update to using `v5` of the [cypress-io/github-action](https://github.com/cypress-io/github-action) action.*

## Contributing

Please see our [Contributing Guideline](./CONTRIBUTING.md) which explains how to contribute fixes or features to the repo and how to test.

## License

[![license][license-badge]][license-file]

This project is licensed under the terms of the [MIT license][license-file].

<!-- badge links follow -->
[ci-badge]: https://github.com/cypress-io/github-action/workflows/main/badge.svg?branch=master
[ci-workflow]: https://github.com/cypress-io/github-action/actions/workflows/main.yml
[cloud-badge]: https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/3tb7jn/master&style=flat&logo=cypress
[cloud-project]: https://cloud.cypress.io/projects/3tb7jn/runs
[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-bot]: https://github.com/renovatebot
[license-badge]: https://img.shields.io/badge/license-MIT-green.svg
[license-file]: ./LICENSE.md

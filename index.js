// @ts-check
const { restoreCache, saveCache } = require('@actions/cache')
const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')
const { Octokit } = require('@octokit/core')
const hasha = require('hasha')
const fs = require('fs')
const os = require('os')
const path = require('path')
const quote = require('quote')
const cliParser = require('argument-vector')()
const findYarnWorkspaceRoot = require('find-yarn-workspace-root')
const debug = require('debug')('@cypress/github-action')
const { ping } = require('./src/ping')
const { SUMMARY_ENV_VAR } = require('@actions/core/lib/summary')

/**
 * Parses input command, finds the tool and
 * the runs the command.
 */
const execCommand = (
  fullCommand,
  waitToFinish = true,
  label = 'executing'
) => {
  const cwd = cypressCommandOptions.cwd

  console.log('%s command "%s"', label, fullCommand)
  console.log('current working directory "%s"', cwd)

  const args = cliParser.parse(fullCommand)
  debug(`parsed command: ${args.join(' ')}`)

  return io.which(args[0], true).then((toolPath) => {
    debug(`found command "${toolPath}"`)
    debug(`with arguments ${args.slice(1).join(' ')}`)

    const toolArguments = args.slice(1)
    const argsString = toolArguments.join(' ')
    debug(`running ${quote(toolPath)} ${argsString} in ${cwd}`)
    debug(`waiting for the command to finish? ${waitToFinish}`)

    const promise = exec.exec(
      quote(toolPath),
      toolArguments,
      cypressCommandOptions
    )
    if (waitToFinish) {
      return promise
    }
  })
}

const isWindows = () => os.platform() === 'win32'
const isUrl = (s) => /^https?:\/\//.test(s)

/**
 * Quote strings that contain Windows delimiters.
 * https://github.com/cypress-io/github-action/issues/459
 */
const quoteWindowsArgument = (value) => {
  if (!/[,;=\s]/.test(value)) {
    return value
  }
  return quote(value)
}

/**
 * Returns true if the Cypress binary installation was skipped
 * via an environment variable https://on.cypress.io/installing
 */
const isCypressBinarySkipped = () =>
  process.env.CYPRESS_INSTALL_BINARY === '0'

const homeDirectory = os.homedir()
const platformAndArch = `${process.platform}-${process.arch}`

const startWorkingDirectory = process.cwd()
// seems the working directory should be absolute to work correctly
// https://github.com/cypress-io/github-action/issues/211
const workingDirectory = core.getInput('working-directory')
  ? path.resolve(core.getInput('working-directory'))
  : startWorkingDirectory
debug(`working directory ${workingDirectory}`)

/**
 * When running "npm install" or any other Cypress-related commands,
 * use the install directory as current working directory
 */
const cypressCommandOptions = {
  cwd: workingDirectory
}

const yarnFilename = path.join(
  findYarnWorkspaceRoot(workingDirectory) || workingDirectory,
  'yarn.lock'
)
const pnpmLockFilename = path.join(workingDirectory, 'pnpm-lock.yaml')
const packageLockFilename = path.join(
  workingDirectory,
  'package-lock.json'
)

const useYarn = () => fs.existsSync(yarnFilename)
const usePnpm = () => fs.existsSync(pnpmLockFilename)
const useNpm = () => fs.existsSync(packageLockFilename)

const lockHash = () => {
  const lockFilename = useYarn()
    ? yarnFilename
    : usePnpm()
    ? pnpmLockFilename
    : useNpm()
    ? packageLockFilename
    : noLockFile()
  const fileHash = hasha.fromFileSync(lockFilename)
  debug(`Hash from file ${lockFilename} is ${fileHash}`)
  return fileHash
}

const noLockFile = () => {
  core.error(
    `Action failed. Missing package manager lockfile. ` +
      `Expecting one of package-lock.json (npm), pnpm-lock.yaml (pnpm) or yarn.lock (yarn) in working-directory ` +
      workingDirectory
  )
  process.exit(1)
}

// enforce the same npm cache folder across different operating systems
const NPM_CACHE_FOLDER = path.join(homeDirectory, '.npm')
const getNpmCache = () => {
  const o = {}
  let key = core.getInput('cache-key')
  const hash = lockHash()
  if (!key) {
    if (useYarn()) {
      key = `yarn-${platformAndArch}-${hash}`
    } else if (usePnpm()) {
      key = `pnpm-${platformAndArch}-${hash}`
    } else {
      key = `npm-${platformAndArch}-${hash}`
    }
  } else {
    console.log('using custom cache key "%s"', key)
  }

  if (useYarn()) {
    o.inputPath = path.join(homeDirectory, '.cache', 'yarn')
  } else if (usePnpm()) {
    o.inputPath = NPM_CACHE_FOLDER
  } else {
    o.inputPath = NPM_CACHE_FOLDER
  }

  // use exact restore key to prevent npm cache from growing
  // https://glebbahmutov.com/blog/do-not-let-npm-cache-snowball/
  o.restoreKeys = o.primaryKey = key
  return o
}

// custom Cypress binary cache folder
// see https://on.cypress.io/caching
const CYPRESS_CACHE_FOLDER =
  process.env.CYPRESS_CACHE_FOLDER ||
  path.join(homeDirectory, '.cache', 'Cypress')
debug(`using custom Cypress cache folder "${CYPRESS_CACHE_FOLDER}"`)

const getCypressBinaryCache = () => {
  const o = {
    inputPath: CYPRESS_CACHE_FOLDER
  }
  const hash = lockHash()
  const key = `cypress-${platformAndArch}-${hash}`

  // use only exact restore key to prevent cached folder growing in size
  // https://glebbahmutov.com/blog/do-not-let-cypress-cache-snowball/
  o.restoreKeys = o.primaryKey = key
  return o
}

const restoreCachedNpm = () => {
  debug('trying to restore cached npm modules')
  const NPM_CACHE = getNpmCache()
  return restoreCache([NPM_CACHE.inputPath], NPM_CACHE.primaryKey, [
    NPM_CACHE.restoreKeys
  ]).catch((e) => {
    console.warn('Restoring npm cache error: %s', e.message)
  })
}

const saveCachedNpm = () => {
  debug('saving npm modules')
  const NPM_CACHE = getNpmCache()
  return saveCache([NPM_CACHE.inputPath], NPM_CACHE.primaryKey).catch(
    (e) => {
      console.warn('Saving npm cache error: %s', e.message)
    }
  )
}

const restoreCachedCypressBinary = () => {
  debug('trying to restore cached Cypress binary')
  const CYPRESS_BINARY_CACHE = getCypressBinaryCache()
  return restoreCache(
    [CYPRESS_BINARY_CACHE.inputPath],
    CYPRESS_BINARY_CACHE.primaryKey,
    [CYPRESS_BINARY_CACHE.restoreKeys]
  ).catch((e) => {
    console.warn('Restoring Cypress cache error: %s', e.message)
  })
}

const saveCachedCypressBinary = () => {
  debug('saving Cypress binary')

  if (isCypressBinarySkipped()) {
    debug('Skipping Cypress cache save, binary is not installed')
    return Promise.resolve()
  }

  const CYPRESS_BINARY_CACHE = getCypressBinaryCache()
  return saveCache(
    [CYPRESS_BINARY_CACHE.inputPath],
    CYPRESS_BINARY_CACHE.primaryKey
  ).catch((e) => {
    console.warn('Saving Cypress cache error: %s', e.message)
  })
}

const install = () => {
  // prevent lots of progress messages during install
  core.exportVariable('CI', '1')
  core.exportVariable('CYPRESS_CACHE_FOLDER', CYPRESS_CACHE_FOLDER)
  // set npm cache path in case the user has custom install command
  core.exportVariable('npm_config_cache', NPM_CACHE_FOLDER)

  // Note: need to quote found tool to avoid Windows choking on
  // npm paths with spaces like "C:\Program Files\nodejs\npm.cmd ci"
  const installCommand = core.getInput('install-command')
  if (installCommand) {
    debug(`using custom install command "${installCommand}"`)
    return execCommand(installCommand, true, 'install command')
  }

  if (useYarn()) {
    debug('installing npm dependencies using Yarn')
    return io.which('yarn', true).then((yarnPath) => {
      debug(`yarn at "${yarnPath}"`)
      return exec.exec(
        quote(yarnPath),
        ['--frozen-lockfile'],
        cypressCommandOptions
      )
    })
  } else if (usePnpm()) {
    debug('installing npm dependencies using pnpm')
    return io.which('pnpm', true).then((pnpmPath) => {
      debug(`pnpm at "${pnpmPath}"`)
      return exec.exec(
        quote(pnpmPath),
        ['install', '--frozen-lockfile'],
        cypressCommandOptions
      )
    })
  } else {
    debug('installing npm dependencies')
    return io.which('npm', true).then((npmPath) => {
      debug(`npm at "${npmPath}"`)
      return exec.exec(quote(npmPath), ['ci'], cypressCommandOptions)
    })
  }
}

const listCypressBinaries = () => {
  debug(
    `Cypress versions in the cache folder ${CYPRESS_CACHE_FOLDER}`
  )

  if (isCypressBinarySkipped()) {
    debug('Skipping Cypress cache list, binary is not installed')
    return Promise.resolve()
  }

  core.exportVariable('CYPRESS_CACHE_FOLDER', CYPRESS_CACHE_FOLDER)
  return io.which('npx', true).then((npxPath) => {
    return exec.exec(
      quote(npxPath),
      ['cypress', 'cache', 'list'],
      cypressCommandOptions
    )
  })
}

const verifyCypressBinary = () => {
  debug(
    `Verifying Cypress using cache folder ${CYPRESS_CACHE_FOLDER}`
  )
  if (isCypressBinarySkipped()) {
    debug('Skipping Cypress verify, binary is not installed')
    return Promise.resolve()
  }

  core.exportVariable('CYPRESS_CACHE_FOLDER', CYPRESS_CACHE_FOLDER)
  return io.which('npx', true).then((npxPath) => {
    return exec.exec(
      quote(npxPath),
      ['cypress', 'verify'],
      cypressCommandOptions
    )
  })
}

/**
 * Grabs a boolean GitHub Action parameter input and casts it.
 * @param {string} name - parameter name
 * @param {boolean} defaultValue - default value to use if the parameter was not specified
 * @returns {boolean} converted input argument or default value
 */
const getInputBool = (name, defaultValue = false) => {
  const param = core.getInput(name)
  if (param === 'true' || param === '1') {
    return true
  }
  if (param === 'false' || param === '0') {
    return false
  }

  return defaultValue
}

/**
 * Grabs the spec input from the workflow and normalizes
 * it, since sometimes it can be multiline
 * @returns {string|undefined}
 */
const getSpecsList = () => {
  const spec = core.getInput('spec')
  if (!spec) {
    return
  }
  const specLines = spec.split('\n').join(',')
  debug(`extracted spec lines into: "${specLines}"`)
  return specLines
}

const buildAppMaybe = () => {
  const buildApp = core.getInput('build')
  if (!buildApp) {
    return
  }

  debug(`building application using "${buildApp}"`)

  return execCommand(buildApp, true, 'build app')
}

const startServersMaybe = () => {
  let startCommand

  if (isWindows()) {
    // allow custom Windows start command
    startCommand =
      core.getInput('start-windows') || core.getInput('start')
  } else {
    startCommand = core.getInput('start')
  }
  if (!startCommand) {
    debug('No start command found')
    return Promise.resolve()
  }

  // allow commands to be separated using commas or newlines
  const separateStartCommands = startCommand
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  debug(
    `Separated ${
      separateStartCommands.length
    } start commands ${separateStartCommands.join(', ')}`
  )

  return separateStartCommands.map((startCommand) => {
    return execCommand(startCommand, false, `start server`)
  })
}

/**
 * Pings give URL(s) until the timeout expires.
 * @param {string} waitOn A single URL or comma-separated URLs
 * @param {Number?} waitOnTimeout in seconds
 */
const waitOnUrl = (waitOn, waitOnTimeout = 60) => {
  console.log(
    'waiting on "%s" with timeout of %s seconds',
    waitOn,
    waitOnTimeout
  )

  const waitTimeoutMs = waitOnTimeout * 1000

  const waitUrls = waitOn
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  debug(`Waiting for urls ${waitUrls.join(', ')}`)

  // run every wait promise after the previous has finished
  // to avoid "noise" of debug messages
  return waitUrls.reduce((prevPromise, url) => {
    return prevPromise.then(() => {
      debug(`Waiting for url ${url}`)
      return ping(url, waitTimeoutMs)
    })
  }, Promise.resolve())
}

const waitOnMaybe = () => {
  const waitOn = core.getInput('wait-on')
  if (!waitOn) {
    return
  }

  const waitOnTimeout = core.getInput('wait-on-timeout') || '60'
  const timeoutSeconds = parseFloat(waitOnTimeout)

  if (isUrl(waitOn)) {
    return waitOnUrl(waitOn, timeoutSeconds)
  }

  console.log('Waiting using command "%s"', waitOn)
  return execCommand(waitOn, true)
}

const I = (x) => x

/**
 * Asks Cypress API if there were already builds for this commit.
 * In that case increments the count to get unique parallel id.
 */
const getCiBuildId = async () => {
  const {
    GITHUB_WORKFLOW,
    GITHUB_SHA,
    GITHUB_TOKEN,
    GITHUB_RUN_ID,
    GITHUB_REPOSITORY
  } = process.env

  const [owner, repo] = GITHUB_REPOSITORY.split('/')
  let branch
  let buildId = `${GITHUB_WORKFLOW} - ${GITHUB_SHA}`

  if (GITHUB_TOKEN) {
    debug(
      `Determining build id by asking GitHub about run ${GITHUB_RUN_ID}`
    )

    const client = new Octokit({
      auth: GITHUB_TOKEN
    })

    const resp = await client.request(
      'GET /repos/:owner/:repo/actions/runs/:run_id',
      {
        owner,
        repo,
        run_id: parseInt(GITHUB_RUN_ID)
      }
    )

    if (resp && resp.data && resp.data.head_branch) {
      branch = resp.data.head_branch
      debug(`found the branch name ${branch}`)
    }

    // This will return the complete list of jobs for a run with their steps,
    // this should always return data when there are jobs on the workflow.
    // Every time the workflow is re-run the jobs length should stay the same
    // (because the same amount of jobs were ran) but the id of them should change
    // letting us, select the first id as unique id
    // https://docs.github.com/en/rest/reference/actions#list-jobs-for-a-workflow-run
    const runsList = await client.request(
      'GET /repos/:owner/:repo/actions/runs/:run_id/jobs',
      {
        owner,
        repo,
        run_id: parseInt(GITHUB_RUN_ID)
      }
    )

    if (
      runsList &&
      runsList.data &&
      runsList.data.jobs &&
      runsList.data.jobs.length
    ) {
      const jobId = runsList.data.jobs[0].id
      debug(`fetched run list with jobId ${jobId}`)
      buildId = `${GITHUB_RUN_ID}-${jobId}`
    } else {
      debug('could not get run list data')
    }
  }

  debug(`determined branch ${branch} and build id ${buildId}`)
  return { branch, buildId }
}

/**
 * Forms entire command line like "npx cypress run ..."
 */
const runTestsUsingCommandLine = async () => {
  debug('Running Cypress tests using CLI command')
  const quoteArgument = isWindows() ? quoteWindowsArgument : I

  const commandPrefix = core.getInput('command-prefix')
  if (!commandPrefix) {
    throw new Error('Expected command prefix')
  }

  const record = getInputBool('record')
  const parallel = getInputBool('parallel')
  const component = getInputBool('component')
  const headed = getInputBool('headed')

  // TODO using yarn to run cypress when yarn is used for install
  // split potentially long command?

  let cmd = []
  // we need to split the command prefix into individual arguments
  // otherwise they are passed all as a single string
  const parts = commandPrefix.split(' ')
  cmd = cmd.concat(parts)
  debug(`with concatenated command prefix: ${cmd.join(' ')}`)

  // push each CLI argument separately
  cmd.push('cypress')
  cmd.push('run')

  if (component) {
    cmd.push('--component')
  }
  if (headed) {
    cmd.push('--headed')
  }
  if (record) {
    cmd.push('--record')
  }
  if (parallel) {
    cmd.push('--parallel')
  }
  const group = core.getInput('group')
  if (group) {
    cmd.push('--group')
    cmd.push(quoteArgument(group))
  }
  const tag = core.getInput('tag')
  if (tag) {
    cmd.push('--tag')
    cmd.push(quoteArgument(tag))
  }
  const configInput = core.getInput('config')
  if (configInput) {
    cmd.push('--config')
    cmd.push(quoteArgument(configInput))
  }
  const spec = getSpecsList()
  if (spec) {
    cmd.push('--spec')
    cmd.push(quoteArgument(spec))
  }
  const project = core.getInput('project')
  if (project) {
    cmd.push('--project')
    cmd.push(quoteArgument(project))
  }
  const configFileInput = core.getInput('config-file')
  if (configFileInput) {
    cmd.push('--config-file')
    cmd.push(quoteArgument(configFileInput))
  }
  const autoCancelAfterFailures = core.getInput(
    'auto-cancel-after-failures'
  )
  if (autoCancelAfterFailures) {
    cmd.push('--auto-cancel-after-failures')
    cmd.push(quoteArgument(autoCancelAfterFailures))
  }

  if (parallel || group) {
    let buildIdVar = null
    if (!core.getInput('ci-build-id')) {
      const { branch, buildId } = await getCiBuildId()
      if (branch) {
        core.exportVariable('GH_BRANCH', branch)
      }
      buildIdVar = buildId
    }

    cmd.push('--ci-build-id')
    const ciBuildId = core.getInput('ci-build-id') || buildIdVar
    cmd.push(quoteArgument(ciBuildId))
  }

  const browser = core.getInput('browser')
  if (browser) {
    cmd.push('--browser')
    // TODO should browser be quoted?
    // If it is a path, it might have spaces
    cmd.push(browser)
  }

  const envInput = core.getInput('env')
  if (envInput) {
    // TODO should env be quoted?
    // If it is a JSON, it might have spaces
    cmd.push('--env')
    cmd.push(envInput)
  }

  const quiet = getInputBool('quiet')
  if (quiet) {
    cmd.push('--quiet')
  }

  console.log('Cypress test command: npx %s', cmd.join(' '))

  // since we have quoted arguments ourselves, do not double quote them
  const opts = {
    ...cypressCommandOptions,
    windowsVerbatimArguments: false
  }

  debug(`in working directory "${cypressCommandOptions.cwd}"`)

  const npxPath = await io.which('npx', true)
  debug(`npx path: ${npxPath}`)

  return exec.exec(quote(npxPath), cmd, opts)
}

/**
 * Run Cypress tests by collecting input parameters
 * and using Cypress module API to run tests.
 * @see https://on.cypress.io/module-api
 */
const runTests = async () => {
  const commandPrefix = core.getInput('command-prefix')
  const customCommand = core.getInput('command')
  const cypressOptions = {
    headed: getInputBool('headed'),
    record: getInputBool('record'),
    parallel: getInputBool('parallel'),
    quiet: getInputBool('quiet'),
    component: getInputBool('component')
  }
  const runTests = getInputBool('runTests', true)
  const spec = getSpecsList()

  if (!runTests) {
    console.log('Skipping running tests: runTests parameter is false')
    return
  }

  // export common environment variables that help run Cypress
  core.exportVariable('CYPRESS_CACHE_FOLDER', CYPRESS_CACHE_FOLDER)
  core.exportVariable('TERM', 'xterm')

  if (customCommand) {
    console.log('Using custom test command: %s', customCommand)
    return execCommand(customCommand, true, 'run tests')
  }

  if (commandPrefix) {
    return runTestsUsingCommandLine()
  }

  const cypressModulePath =
    require.resolve('cypress', { paths: [workingDirectory] }) ||
    'cypress'
  const cypress = require(cypressModulePath)

  debug('Running Cypress tests using Module API')
  debug(`requiring cypress dependency, cwd is ${process.cwd()}`)
  debug(`working directory ${workingDirectory}`)
  debug(`resolved cypress ${cypressModulePath}`)

  if (core.getInput('group')) {
    cypressOptions.group = core.getInput('group')
  }

  if (core.getInput('tag')) {
    cypressOptions.tag = core.getInput('tag')
  }

  if (core.getInput('config')) {
    cypressOptions.config = core.getInput('config')
    debug(`Cypress config "${cypressOptions.config}"`)
  }

  if (spec) {
    cypressOptions.spec = spec
  }

  if (core.getInput('config-file')) {
    cypressOptions.configFile = core.getInput('config-file')
  }

  // if the user set the explicit folder, use that
  if (core.getInput('project')) {
    cypressOptions.project = core.getInput('project')
  }

  if (core.getInput('browser')) {
    cypressOptions.browser = core.getInput('browser')
  }

  if (core.getInput('auto-cancel-after-failures')) {
    cypressOptions.autoCancelAfterFailures = core.getInput(
      'auto-cancel-after-failures'
    )
  }

  if (core.getInput('env')) {
    cypressOptions.env = core.getInput('env')
  }

  if (cypressOptions.parallel || cypressOptions.group) {
    const { branch, buildId } = await getCiBuildId()
    if (branch) {
      core.exportVariable('GH_BRANCH', branch)
    }

    cypressOptions.ciBuildId = core.getInput('ci-build-id') || buildId
  }

  debug(`Cypress options ${JSON.stringify(cypressOptions)}`)

  const onTestsFinished = (testResults) => {
    const resultsUrl = testResults.runUrl
    process.chdir(startWorkingDirectory)

    if (testResults.failures) {
      console.error('Test run failed, code %d', testResults.failures)
      console.error('More information might be available above')

      if (testResults.message) {
        console.error(
          'Cypress module has returned the following error message:'
        )
        console.error(testResults.message)
      }

      return Promise.reject(
        new Error(testResults.message || 'Error running Cypress')
      )
    }

    debug(`Cypress tests: ${testResults.totalFailed} failed`)

    if (resultsUrl) {
      debug(`resultsUrl ${resultsUrl}`)
    } else {
      debug('There is no resultsUrl')
    }

    // we still set the output explicitly
    core.setOutput('dashboardUrl', resultsUrl) // deprecated and retained for backward compatibility
    core.setOutput('resultsUrl', resultsUrl) // replacement for dashboardUrl

    if (testResults.totalFailed) {
      return Promise.reject(
        new Error(`Cypress tests: ${testResults.totalFailed} failed`)
      )
    }
  }

  const onTestsError = (e) => {
    process.chdir(startWorkingDirectory)

    console.error(e)
    return Promise.reject(e)
  }

  process.chdir(workingDirectory)
  return cypress
    .run(cypressOptions)
    .then(generateSummary)
    .then(onTestsFinished, onTestsError)
}

// Summary is not available for GitHub Enterprise at the moment
const isSummaryEnabled = () => {
  const isSummaryInput = getInputBool('publish-summary')
  return process.env[SUMMARY_ENV_VAR] !== undefined && isSummaryInput
}

const generateSummary = async (testResults) => {
  if (!isSummaryEnabled()) {
    return testResults
  }

  const headers = [
    { data: 'Result', header: true },
    { data: 'Passed :white_check_mark:', header: true },
    { data: 'Failed :x:', header: true },
    { data: 'Pending :hand:', header: true },
    { data: 'Skipped :leftwards_arrow_with_hook:', header: true },
    { data: 'Duration :clock8:', header: true }
  ]

  const status =
    testResults.totalFailed === 0
      ? 'Passing :white_check_mark:'
      : 'Failing :red_circle:'

  const summaryRows = [
    status,
    `${testResults.totalPassed}`,
    `${testResults.totalFailed}`,
    `${testResults.totalPending}`,
    `${testResults.totalSkipped}`,
    `${testResults.totalDuration / 1000}s` || ''
  ]

  await core.summary
    .addHeading('Cypress Results', 2)
    .addTable([headers, summaryRows])
    .addLink(
      testResults.runUrl ? 'View run in Cypress Cloud' : '',
      testResults.runUrl || ''
    )
    .write()

  return testResults
}

const installMaybe = () => {
  const installParameter = getInputBool('install', true)
  if (!installParameter) {
    console.log('Skipping install because install parameter is false')
    return Promise.resolve()
  }

  return Promise.all([
    restoreCachedNpm(),
    restoreCachedCypressBinary()
  ]).then(([npmCacheHit, cypressCacheHit]) => {
    debug(`npm cache hit ${npmCacheHit}`)
    debug(`cypress cache hit ${cypressCacheHit}`)

    return install().then(() => {
      debug('install has finished')
      return listCypressBinaries().then(() => {
        if (npmCacheHit && cypressCacheHit) {
          debug('no need to verify Cypress binary or save caches')
          return Promise.resolve(undefined)
        }

        debug('verifying Cypress binary')
        return verifyCypressBinary()
          .then(saveCachedNpm)
          .then(saveCachedCypressBinary)
      })
    })
  })
}

installMaybe()
  .then(buildAppMaybe)
  .then(startServersMaybe)
  .then(waitOnMaybe)
  .then(runTests)
  .then(() => {
    debug('all done, exiting')
    // force exit to avoid waiting for child processes,
    // like the server we have started
    // see https://github.com/actions/toolkit/issues/216
    process.exit(0)
  })
  .catch((error) => {
    // final catch - when anything goes wrong, throw an error
    // and exit the action with non-zero code
    debug(error.message)
    debug(error.stack)

    core.setFailed(error.message)
    process.exit(1)
  })

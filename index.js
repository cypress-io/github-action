// @ts-check
const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')
const hasha = require('hasha')
const {
  restoreCache,
  saveCache
} = require('cache/lib/index')
const fs = require('fs')
const os = require('os')
const path = require('path')
const quote = require('quote')
const cliParser = require('argument-vector')()

const homeDirectory = os.homedir()

const useYarn = fs.existsSync('yarn.lock')
const lockFilename = useYarn
  ? 'yarn.lock'
  : 'package-lock.json'
const lockHash = hasha.fromFileSync(lockFilename)
const platformAndArch = `${process.platform}-${process.arch}`

// enforce the same NPM cache folder across different operating systems
const NPM_CACHE_FOLDER = path.join(homeDirectory, '.npm')
const NPM_CACHE = (() => {
  const o = {}
  let key = core.getInput('cache-key')

  if (!key) {
    if (useYarn) {
      key = `yarn-${platformAndArch}-${lockHash}`
    } else {
      key = `npm-${platformAndArch}-${lockHash}`
    }
  } else {
    console.log('using custom cache key "%s"', key)
  }

  if (useYarn) {
    o.inputPath = path.join(homeDirectory, '.cache', 'yarn')
  } else {
    o.inputPath = NPM_CACHE_FOLDER
  }

  o.restoreKeys = o.primaryKey = key
  return o
})()

// custom Cypress binary cache folder
// see https://on.cypress.io/caching
const CYPRESS_CACHE_FOLDER = path.join(
  homeDirectory,
  '.cache',
  'Cypress'
)
core.debug(
  `using custom Cypress cache folder "${CYPRESS_CACHE_FOLDER}"`
)

const CYPRESS_BINARY_CACHE = (() => {
  const o = {
    inputPath: CYPRESS_CACHE_FOLDER,
    restoreKeys: `cypress-${platformAndArch}-`
  }
  o.primaryKey = o.restoreKeys + lockHash
  return o
})()

const restoreCachedNpm = () => {
  core.debug('trying to restore cached NPM modules')
  return restoreCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey,
    NPM_CACHE.restoreKeys
  )
}

const saveCachedNpm = () => {
  core.debug('saving NPM modules')
  return saveCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey
  )
}

const restoreCachedCypressBinary = () => {
  core.debug('trying to restore cached Cypress binary')
  return restoreCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey,
    CYPRESS_BINARY_CACHE.restoreKeys
  )
}

const saveCachedCypressBinary = () => {
  core.debug('saving Cypress binary')
  return saveCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey
  )
}

const install = () => {
  // prevent lots of progress messages during install
  core.exportVariable('CI', '1')
  core.exportVariable(
    'CYPRESS_CACHE_FOLDER',
    CYPRESS_CACHE_FOLDER
  )

  // Note: need to quote found tool to avoid Windows choking on
  // npm paths with spaces like "C:\Program Files\nodejs\npm.cmd ci"

  if (useYarn) {
    core.debug('installing NPM dependencies using Yarn')
    return io.which('yarn', true).then(yarnPath => {
      core.debug(`yarn at "${yarnPath}"`)
      return exec.exec(quote(yarnPath), [
        '--frozen-lockfile'
      ])
    })
  } else {
    core.debug('installing NPM dependencies')
    core.exportVariable(
      'npm_config_cache',
      NPM_CACHE_FOLDER
    )

    return io.which('npm', true).then(npmPath => {
      core.debug(`npm at "${npmPath}"`)
      return exec.exec(quote(npmPath), ['ci'])
    })
  }
}

const verifyCypressBinary = () => {
  core.debug('Verifying Cypress')
  core.exportVariable(
    'CYPRESS_CACHE_FOLDER',
    CYPRESS_CACHE_FOLDER
  )
  return io.which('npx', true).then(npxPath => {
    return exec.exec(quote(npxPath), ['cypress', 'verify'])
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

const buildAppMaybe = () => {
  const buildApp = core.getInput('build')
  if (!buildApp) {
    return
  }

  core.debug(`building application using "${buildApp}"`)

  return exec.exec(buildApp)
}

const startServerMaybe = () => {
  let startCommand

  if (os.platform() === 'win32') {
    // allow custom Windows start command
    startCommand =
      core.getInput('start-windows') ||
      core.getInput('start')
  } else {
    startCommand = core.getInput('start')
  }
  if (!startCommand) {
    core.debug('No start command found')
    return
  }

  console.log(
    'starting server with command "%s"',
    startCommand
  )
  console.log(
    'current working directory "%s"',
    process.cwd()
  )

  const args = cliParser.parse(startCommand)
  core.debug(`parsed command: ${args.join(' ')}`)

  return io.which(args[0], true).then(toolPath => {
    core.debug(`found command "${toolPath}"`)
    core.debug(`with arguments ${args.slice(1).join(' ')}`)

    const toolArguments = args.slice(1)
    core.debug(
      `running ${quote(toolPath)} ${toolArguments.join(
        ' '
      )}`
    )
    core.debug('without waiting for the promise to resolve')

    exec.exec(quote(toolPath), toolArguments)
  })
}

const waitOnMaybe = () => {
  const waitOn = core.getInput('wait-on')
  if (!waitOn) {
    return
  }

  const waitOnTimeout =
    core.getInput('wait-on-timeout') || '60'

  console.log(
    'waiting on "%s" with timeout of %s seconds',
    waitOn,
    waitOnTimeout
  )

  return io.which('npx', true).then(npxPath => {
    return exec.exec(quote(npxPath), [
      'wait-on',
      '--timeout',
      waitOnTimeout,
      quote(waitOn)
    ])
  })
}

const I = x => x

const runTests = () => {
  const runTests = getInputBool('runTests', true)
  if (!runTests) {
    console.log(
      'Skipping running tests: runTests parameter is false'
    )
    return
  }

  core.debug('Running Cypress tests')
  const quoteArgument =
    os.platform() === 'win32' ? quote : I

  const record = getInputBool('record')
  const parallel = getInputBool('parallel')

  // TODO using yarn to run cypress when yarn is used for install
  return io.which('npx', true).then(npxPath => {
    core.exportVariable(
      'CYPRESS_CACHE_FOLDER',
      CYPRESS_CACHE_FOLDER
    )

    const cmd = ['cypress', 'run']
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
    const configInput = core.getInput('config')
    if (configInput) {
      cmd.push('--config')
      cmd.push(quoteArgument(configInput))
    }
    const configFileInput = core.getInput('config-file')
    if (configFileInput) {
      cmd.push('--config-file')
      cmd.push(quoteArgument(configFileInput))
    }
    if (parallel || group) {
      // on GitHub Actions we can use workflow name and SHA commit to tie multiple jobs together
      // until a better workflow id is available
      // https://github.community/t5/GitHub-Actions/Add-build-number/td-p/30548
      // https://github.com/actions/toolkit/issues/65
      const { GITHUB_WORKFLOW, GITHUB_SHA } = process.env
      const parallelId = `${GITHUB_WORKFLOW} - ${GITHUB_SHA}`
      cmd.push('--ci-build-id')
      cmd.push(quoteArgument(parallelId))
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

    console.log(
      'Cypress test command: npx %s',
      cmd.join(' ')
    )

    core.exportVariable('TERM', 'xterm')
    // since we have quoted arguments ourselves, do not double quote them
    const options = {
      windowsVerbatimArguments: false
    }
    const workingDirectory = core.getInput(
      'working-directory'
    )
    if (workingDirectory) {
      options.cwd = workingDirectory
      core.debug(
        `in working directory "${workingDirectory}"`
      )
    }
    return exec.exec(quote(npxPath), cmd, options)
  })
}

const installMaybe = () => {
  const installParameter = getInputBool('install', true)
  if (!installParameter) {
    console.log(
      'Skipping install because install parameter is false'
    )
    return Promise.resolve()
  }

  return Promise.all([
    restoreCachedNpm(),
    restoreCachedCypressBinary()
  ]).then(([npmCacheHit, cypressCacheHit]) => {
    core.debug(`npm cache hit ${npmCacheHit}`)
    core.debug(`cypress cache hit ${cypressCacheHit}`)

    return install().then(() => {
      if (npmCacheHit && cypressCacheHit) {
        core.debug(
          'no need to verify Cypress binary or save caches'
        )
        return
      }

      return verifyCypressBinary()
        .then(saveCachedNpm)
        .then(saveCachedCypressBinary)
    })
  })
}

installMaybe()
  .then(buildAppMaybe)
  .then(startServerMaybe)
  .then(waitOnMaybe)
  .then(runTests)
  .then(() => {
    core.debug('all done, exiting')
    // force exit to avoid waiting for child processes,
    // like the server we have started
    // see https://github.com/actions/toolkit/issues/216
    process.exit(0)
  })
  .catch(error => {
    console.log(error)
    core.setFailed(error.message)
    process.exit(1)
  })

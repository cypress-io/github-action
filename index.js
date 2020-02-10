// @ts-check
const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')
const hasha = require('hasha')
const got = require('got')
const {
  restoreCache,
  saveCache
} = require('cache/lib/index')
const fs = require('fs')
const os = require('os')
const path = require('path')
const quote = require('quote')
const cliParser = require('argument-vector')()

/**
 * A small utility for checking when an URL responds, kind of
 * a poor man's https://www.npmjs.com/package/wait-on
 */
const ping = (url, timeout) => {
  const start = +new Date()
  return got(url, {
    retry: {
      retries(retry, error) {
        const now = +new Date()
        core.debug(
          `${now - start}ms ${error.method} ${error.host} ${
            error.code
          }`
        )
        if (now - start > timeout) {
          console.error('%s timed out', url)
          return 0
        }
        return 1000
      }
    }
  })
}

const isWindows = () => os.platform() === 'win32'

const homeDirectory = os.homedir()
const platformAndArch = `${process.platform}-${process.arch}`

const workingDirectory =
  core.getInput('working-directory') || process.cwd()

/**
 * When running "npm install" or any other Cypress-related commands,
 * use the install directory as current working directory
 */
const cypressCommandOptions = {
  cwd: workingDirectory
}

const yarnFilename = path.join(
  workingDirectory,
  'yarn.lock'
)
const packageLockFilename = path.join(
  workingDirectory,
  'package-lock.json'
)

const useYarn = () => fs.existsSync(yarnFilename)

const lockHash = () => {
  const lockFilename = useYarn()
    ? yarnFilename
    : packageLockFilename
  return hasha.fromFileSync(lockFilename)
}

// enforce the same NPM cache folder across different operating systems
const NPM_CACHE_FOLDER = path.join(homeDirectory, '.npm')
const getNpmCache = () => {
  const o = {}
  let key = core.getInput('cache-key')
  const hash = lockHash()
  if (!key) {
    if (useYarn()) {
      key = `yarn-${platformAndArch}-${hash}`
    } else {
      key = `npm-${platformAndArch}-${hash}`
    }
  } else {
    console.log('using custom cache key "%s"', key)
  }

  if (useYarn()) {
    o.inputPath = path.join(homeDirectory, '.cache', 'yarn')
  } else {
    o.inputPath = NPM_CACHE_FOLDER
  }

  o.restoreKeys = o.primaryKey = key
  return o
}

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

const getCypressBinaryCache = () => {
  const o = {
    inputPath: CYPRESS_CACHE_FOLDER,
    restoreKeys: `cypress-${platformAndArch}-`
  }
  o.primaryKey = o.restoreKeys + lockHash()
  return o
}

const restoreCachedNpm = () => {
  core.debug('trying to restore cached NPM modules')
  const NPM_CACHE = getNpmCache()
  return restoreCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey,
    NPM_CACHE.restoreKeys
  )
}

const saveCachedNpm = () => {
  core.debug('saving NPM modules')
  const NPM_CACHE = getNpmCache()
  return saveCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey
  )
}

const restoreCachedCypressBinary = () => {
  core.debug('trying to restore cached Cypress binary')
  const CYPRESS_BINARY_CACHE = getCypressBinaryCache()
  return restoreCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey,
    CYPRESS_BINARY_CACHE.restoreKeys
  )
}

const saveCachedCypressBinary = () => {
  core.debug('saving Cypress binary')
  const CYPRESS_BINARY_CACHE = getCypressBinaryCache()
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

  if (useYarn()) {
    core.debug('installing NPM dependencies using Yarn')
    return io.which('yarn', true).then(yarnPath => {
      core.debug(`yarn at "${yarnPath}"`)
      return exec.exec(
        quote(yarnPath),
        ['--frozen-lockfile'],
        cypressCommandOptions
      )
    })
  } else {
    core.debug('installing NPM dependencies')
    core.exportVariable(
      'npm_config_cache',
      NPM_CACHE_FOLDER
    )

    return io.which('npm', true).then(npmPath => {
      core.debug(`npm at "${npmPath}"`)
      return exec.exec(
        quote(npmPath),
        ['ci'],
        cypressCommandOptions
      )
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

const buildAppMaybe = () => {
  const buildApp = core.getInput('build')
  if (!buildApp) {
    return
  }

  core.debug(`building application using "${buildApp}"`)

  // TODO: allow specifying custom working folder?
  return exec.exec(buildApp)
}

const startServerMaybe = () => {
  let startCommand

  if (isWindows()) {
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

    // TODO specify working directory when running the server?
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

  const waitTimeoutMs = parseFloat(waitOnTimeout) * 1000

  return ping(waitOn, waitTimeoutMs)
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
  const quoteArgument = isWindows() ? quote : I

  const commandPrefix = core.getInput('command-prefix')
  const record = getInputBool('record')
  const parallel = getInputBool('parallel')
  const headless = getInputBool('headless')

  // TODO using yarn to run cypress when yarn is used for install
  // split potentially long

  return io.which('npx', true).then(npxPath => {
    core.exportVariable(
      'CYPRESS_CACHE_FOLDER',
      CYPRESS_CACHE_FOLDER
    )

    let cmd = []
    if (commandPrefix) {
      // we need to split the command prefix into individual arguments
      // otherwise they are passed all as a single string
      const parts = commandPrefix.split(' ')
      cmd = cmd.concat(parts)
      core.debug(
        `with concatenated command prefix: ${cmd.join(' ')}`
      )
    }
    // push each CLI argument separately
    cmd.push('cypress')
    cmd.push('run')
    if (headless) {
      cmd.push('--headless')
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
    const spec = core.getInput('spec')
    if (spec) {
      cmd.push('--spec')
      cmd.push(quoteArgument(spec))
    }
    const configFileInput = core.getInput('config-file')
    if (configFileInput) {
      cmd.push('--config-file')
      cmd.push(quoteArgument(configFileInput))
    }
    if (parallel || group) {
      const customCiBuildId = core.getInput('ci-build-id')

      if (customCiBuildId) {
        cmd.push('--ci-build-id')
        cmd.push(quoteArgument(customCiBuildId))
      }
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
    const opts = {
      ...cypressCommandOptions,
      windowsVerbatimArguments: false
    }

    core.debug(
      `in working directory "${cypressCommandOptions.workingDirectory}"`
    )
    return exec.exec(quote(npxPath), cmd, opts)
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

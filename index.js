// @ts-check
const core = require('@actions/core')
const exec = require('@actions/exec')
const hasha = require('hasha')
const execa = require('execa')
const { restoreCache, saveCache } = require('cache/lib/index')

const packageLockHash = hasha.fromFileSync('./package-lock.json')
const platformAndArch = `${process.platform}-${process.arch}`

const NPM_CACHE = (() => {
  const o = {
    inputPath: '~/.npm',
    restoreKeys: `npm-${platformAndArch}-`
  }
  o.primaryKey = o.restoreKeys + packageLockHash
  return o
})()

const CYPRESS_BINARY_CACHE = (() => {
  const o = {
    inputPath: '~/.cache/Cypress',
    restoreKeys: `cypress-${platformAndArch}-`
  }
  o.primaryKey = o.restoreKeys + packageLockHash
  return o
})()

const restoreCachedNpm = () => {
  console.log('trying to restore cached NPM modules')
  return restoreCache(
    NPM_CACHE.inputPath,
    NPM_CACHE.primaryKey,
    NPM_CACHE.restoreKeys
  )
}

const saveCachedNpm = () => {
  console.log('saving NPM modules')
  return saveCache(NPM_CACHE.inputPath, NPM_CACHE.primaryKey)
}

const restoreCachedCypressBinary = () => {
  console.log('trying to restore cached Cypress binary')
  return restoreCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey,
    CYPRESS_BINARY_CACHE.restoreKeys
  )
}

const saveCachedCypressBinary = () => {
  console.log('saving Cypress binary')
  return saveCache(
    CYPRESS_BINARY_CACHE.inputPath,
    CYPRESS_BINARY_CACHE.primaryKey
  )
}

const install = () => {
  console.log('installing NPM dependencies')
  // prevent lots of progress messages during install
  core.exportVariable('CI', '1')
  return exec.exec('npm ci')
}

const verifyCypressBinary = () => {
  console.log('Verifying Cypress')
  return exec.exec('npx cypress verify')
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

const startServerMaybe = () => {
  const startCommand = core.getInput('start')
  if (!startCommand) {
    console.log('No start command found')
    return
  }

  console.log('starting server with command "%s"', startCommand)
  console.log('current working directory "%s"', process.cwd())

  const childProcess = execa(startCommand, {
    shell: true,
    detached: true,
    stdio: 'inherit'
  })
  // allow child process to run in the background
  // https://nodejs.org/api/child_process.html#child_process_options_detached
  childProcess.unref()
  console.log('child process unref')
}

const runTests = () => {
  const runTests = getInputBool('runTests', true)
  if (!runTests) {
    console.log('Skipping running tests: runTests parameter is false')
    return
  }

  console.log('Running Cypress tests')

  const record = getInputBool('record')
  const parallel = getInputBool('parallel')

  let cmd = 'npx cypress run'
  if (record) {
    cmd += ' --record'
  }
  if (parallel) {
    // on GitHub Actions we can use workflow name and SHA commit to tie multiple jobs together
    const parallelId = `${process.env.GITHUB_WORKFLOW} - ${
      process.env.GITHUB_SHA
    }`
    cmd += ` --parallel --ci-build-id "${parallelId}"`
  }
  const group = core.getInput('group')
  if (group) {
    cmd += ` --group "${group}"`
  }
  console.log('Cypress test command: %s', cmd)

  core.exportVariable('TERM', 'xterm')
  return exec.exec(cmd)
}

Promise.all([restoreCachedNpm(), restoreCachedCypressBinary()])
  .then(([npmCacheHit, cypressCacheHit]) => {
    console.log('npm cache hit', npmCacheHit)
    console.log('cypress cache hit', cypressCacheHit)

    return install().then(() => {
      if (npmCacheHit && cypressCacheHit) {
        console.log('no need to verify Cypress binary or save caches')
        return
      }

      return verifyCypressBinary()
        .then(saveCachedNpm)
        .then(saveCachedCypressBinary)
    })
  })
  .then(startServerMaybe)
  .then(runTests)
  .catch(error => {
    console.log(error)
    core.setFailed(error.message)
  })

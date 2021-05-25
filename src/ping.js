const core = require('@actions/core')
const got = require('got')
const debug = require('debug')('@cypress/github-action')

/**
 * A small utility for checking when an URL responds, kind of
 * a poor man's https://www.npmjs.com/package/wait-on. This version
 * is implemented using https://github.com/sindresorhus/got
 */
const ping = (url, timeout) => {
  if (!timeout) {
    throw new Error('Expected timeout in ms')
  }

  // make copy of the error codes that "got" retries on
  const errorCodes = [...got.defaults.options.retry.errorCodes]
  errorCodes.push('ESOCKETTIMEDOUT')

  // we expect the server to respond within a time limit
  // and if it does not - retry up to total "timeout" duration
  const individualPingTimeout = Math.min(timeout, 30000)

  // add to the timeout max individual ping timeout
  // to avoid long-waiting ping from "rolling" over the end
  // and preventing pinging the last time
  timeout += individualPingTimeout
  const limit = Math.ceil(timeout / individualPingTimeout)

  debug(`total ping timeout ${timeout}`)
  debug(`individual ping timeout ${individualPingTimeout}ms`)
  debug(`retries limit ${limit}`)

  const start = +new Date()
  return got(url, {
    headers: {
      Accept: 'text/html, application/json, text/plain, */*'
    },
    timeout: individualPingTimeout,
    errorCodes,
    retry: {
      limit,
      calculateDelay({ error, attemptCount }) {
        if (error) {
          debug(`got error ${JSON.stringify(error)}`)
        }
        const now = +new Date()
        const elapsed = now - start
        debug(
          `${elapsed}ms ${error.method} ${error.host} ${error.code} attempt ${attemptCount}`
        )
        if (elapsed > timeout) {
          console.error(
            '%s timed out on retry %d of %d, elapsed %dms, limit %dms',
            url,
            attemptCount,
            limit,
            elapsed,
            timeout
          )
          return 0
        }

        // if the error code is ECONNREFUSED use shorter timeout
        // because the server is probably starting
        if (error.code === 'ECONNREFUSED') {
          return 1000
        }

        // default "long" timeout
        return individualPingTimeout
      }
    }
  }).then(() => {
    const now = +new Date()
    const elapsed = now - start
    debug(`pinging ${url} has finished ok after ${elapsed}ms`)
  })
}

module.exports = { ping }

const core = require('@actions/core')
const got = require('got')

/**
 * A small utility for checking when an URL responds, kind of
 * a poor man's https://www.npmjs.com/package/wait-on
 */
const ping = (url, timeout) => {
  if (!timeout) {
    throw new Error('Expected timeout in ms')
  }

  const start = +new Date()
  return got(url, {
    timeout: 1000,
    retry: {
      limit: Math.ceil(timeout / 1000),
      calculateDelay({ error }) {
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

module.exports = { ping }

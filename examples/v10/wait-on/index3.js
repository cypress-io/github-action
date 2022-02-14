// this server starts listening right away
// but does not send "res.end()" for the first N seconds

// always log messages
// useful because shows timestamps
const log = require('debug')('*')
const http = require('http')
const arg = require('arg')

const args = arg({
  '--port': Number,
  '--delay': Number
})
const port = args['--port'] || 3050
const errorPeriodSeconds = args['--delay'] || 40

const endErrorsAt = +new Date() + errorPeriodSeconds * 1000

log('creating the server on port %d', port)
log('will not respond for the first %d seconds', errorPeriodSeconds)

setTimeout(function () {
  log('the server will now answer ok')
}, errorPeriodSeconds * 1000)

const server = http.createServer((req, res) => {
  log('request %s %s', req.method, req.url)
  const now = +new Date()
  if (now < endErrorsAt) {
    log('not responding, %d ms left', endErrorsAt - now)
    return
  }

  log('responding all good')
  res.writeHead(200)
  res.end('all good')
})
server.listen(port, () => {
  log('server is listening')
})

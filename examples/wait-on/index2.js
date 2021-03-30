// this server starts listening right away
// but for the first period sends errors back

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
const errorPeriodSeconds = args['--delay'] || 10

const endErrorsAt = +new Date() + errorPeriodSeconds * 1000

log('creating the server on port %d', port)
log('will respond with errors for %d seconds', errorPeriodSeconds)

setTimeout(() => {
  log('server will start responding with OK from now on')
}, errorPeriodSeconds * 1000)

const server = http.createServer((req, res) => {
  log('request %s %s', req.method, req.url)
  if (new Date() < endErrorsAt) {
    log('responding with error')
    res.writeHead(400)
    res.end()
    return
  }

  log('responding all good')
  res.writeHead(200)
  res.end('all good')
})
server.listen(port, () => {
  log('server is listening')
})

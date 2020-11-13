// this server starts listening right away
// but does not send "res.end()" for the first N seconds

// always log messages
// useful because shows timestamps
const log = require('debug')('*')
const http = require('http')

const errorPeriodSeconds = 40
const endErrorsAt = +new Date() + errorPeriodSeconds * 1000
const port = 3050

log('creating the server on port %d', port)
log('will not respond for the first %d seconds', errorPeriodSeconds)

const server = http.createServer((req, res) => {
  log('request %s %s', req.method, req.url)
  if (new Date() < endErrorsAt) {
    log('not responding')
    return
  }

  log('responding all good')
  res.writeHead(200)
  res.end('all good')
})
server.listen(port, () => {
  log('server is listening')
})

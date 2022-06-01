// this server only starts listening to
// the incoming requests after a delay

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
const createServerAfterSeconds = args['--delay'] || 7

log(
  'starting the server at port %d after %d seconds',
  port,
  createServerAfterSeconds
)

setTimeout(function () {
  log('creating the server on port %d', port)
  const server = http.createServer((req, res) => {
    log('request %s %s', req.method, req.url)
    res.writeHead(200)
    res.end('all good')
  })
  server.listen(port, () => {
    log('server is listening at port %d', port)
  })
}, createServerAfterSeconds * 1000)

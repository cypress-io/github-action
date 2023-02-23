// this server starts listening right away
// but every response takes 6 seconds

// always log messages
// useful because shows timestamps
const log = require('debug')('*')
const http = require('http')
const arg = require('arg')

const args = arg({
  '--port': Number
})
const port = args['--port'] || 3050

log('creating the server on port %d', port)

const server = http.createServer((req, res) => {
  const reqTimestamp = +new Date()
  log('request at %d: %s %s', reqTimestamp, req.method, req.url)
  setTimeout(function() {
    log('responding to request from %d', reqTimestamp)
    res.writeHead(200)
    res.end('all good')
  }, 6000)
})

server.listen(port, () => {
  log('server is listening')
})

// this server only starts listening to
// the incoming requests after a delay

// always log messages
// useful because shows timestamps
const log = require('debug')('*')
const http = require('http')

log('starting the server...')
setTimeout(function() {
  const port = 3050
  log('creating the server on port %d', port)
  const server = http.createServer((req, res) => {
    log('request %s %s', req.method, req.url)
    res.writeHead(200)
    res.end('all good')
  })
  server.listen(port, () => {
    log('server is listening')
  })
}, 7000)

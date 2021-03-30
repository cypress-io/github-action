// a little CLI utility for testing pinging websites
// node ./src/ping-cli <url>

const { ping } = require('./ping')
const timeoutSeconds = 30
const url = process.argv[2]
console.log('pinging url %s for %d seconds', url, timeoutSeconds)
if (!url) {
  console.error('Missing url to ping')
  process.exit(1)
}
ping(url, timeoutSeconds * 1000)

module.exports = on => {
  on('task', {
    log(message) {
      console.log(message)
      return null
    }
  })
}

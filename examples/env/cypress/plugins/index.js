module.exports = (on, config) => {
  console.log('in plugins file')
  console.log(
    'process.env.CYPRESS_environmentName',
    process.env.CYPRESS_environmentName
  )
  console.log('entire config.env', config.env)
}

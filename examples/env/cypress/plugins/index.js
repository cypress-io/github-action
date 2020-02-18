module.exports = (on, config) => {
  console.log('in plugis file')
  console.log(
    'process.env.CYPRESS_environmentName',
    process.env.CYPRESS_environmentName
  )
  console.log('config.env', config.env)
}

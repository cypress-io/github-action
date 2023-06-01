const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      console.log('logging from cypress.config.js')
      console.log(
        'process.env.CYPRESS_environmentName',
        process.env.CYPRESS_environmentName
      )
      console.log('entire config.env', config.env)
    },
    supportFile: false,
  },
})

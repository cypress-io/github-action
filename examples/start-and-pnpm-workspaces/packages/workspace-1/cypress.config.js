const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: false,
    baseUrl: 'http://localhost:5000',
  },
})

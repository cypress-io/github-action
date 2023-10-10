const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    baseUrl: 'http://localhost:3333',
    setupNodeEvents(on, config) {
      console.log('\nUsing cypress.config-alternate.js config-file')
    },
    supportFile: false
  },
})

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  projectId: '3tb7jn',
  e2e: {
    setupNodeEvents(on, config) {},
    supportFile: false,
  },
})

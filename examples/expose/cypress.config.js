import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents (on, config) {
      console.log('logging from cypress.config.js')
      console.log('entire config.expose', config.expose)
    },
    supportFile: false,
  },
})

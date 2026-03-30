import { defineConfig } from 'cypress'

export default defineConfig({
  defaultBrowser: 'chrome',
  fixturesFolder: false,
  e2e: {
    baseUrl: 'http://localhost:3333',
    setupNodeEvents () {
      console.log('\nUsing cypress.config-alternate.js config-file')
    },
    supportFile: false,
  },
})

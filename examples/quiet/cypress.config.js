import { defineConfig } from 'cypress'

export default defineConfig({
  defaultBrowser: 'chrome',
  fixturesFolder: false,
  e2e: {
    setupNodeEvents (on) {
      on('task', {
        log (message) {
          console.log(message)
          return null
        },
      })
    },
    supportFile: false,
  },
})

import { defineConfig } from 'cypress'

export default defineConfig({
  defaultBrowser: 'chrome',
  fixturesFolder: false,
  projectId: '3tb7jn',
  e2e: {
    supportFile: false,
  },
})

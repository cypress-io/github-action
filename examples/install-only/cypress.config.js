import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    supportFile: false,
    baseUrl: 'https://example.cypress.io/',
  },
})

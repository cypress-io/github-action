import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: false,
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:5173',
  },
})

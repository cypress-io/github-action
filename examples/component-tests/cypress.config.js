import { defineConfig } from 'cypress'

export default defineConfig({
  defaultBrowser: 'chrome',
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})

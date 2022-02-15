const { defineConfig } = require('cypress')
const { devServer } = require('@cypress/react/plugins/react-scripts')

module.exports = defineConfig({
  component: {
    devServer,
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}'
  }
})

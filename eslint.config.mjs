import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginCypress from 'eslint-plugin-cypress/flat'

export default [
  pluginJs.configs.recommended,
  pluginCypress.configs.recommended,
  {
    name: 'global-ignores',
    ignores: ['dist/', 'examples/nextjs/src/app/']
  },
  {
    name: 'all-js',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
]

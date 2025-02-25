import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  pluginJs.configs.recommended,
  { name: 'global-ignores', ignores: ['dist/', 'examples/'] },
  {
    name: `all-js`,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
]

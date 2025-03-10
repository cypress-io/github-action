import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginCypress from 'eslint-plugin-cypress/flat'
import stylistic from '@stylistic/eslint-plugin'

export default [
  pluginJs.configs.recommended,
  pluginCypress.configs.recommended,
  {
    name: 'global-ignores',
    ignores: [
      'dist/',
      'examples/component-tests/dist/',
      'examples/nextjs/.next/',
      'examples/nextjs/src/app/',
      'examples/wait-on-vite/dist/',
    ],
  },
  {
    name: 'all-js',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    name: 'style',
    files: ['eslint.config.mjs', 'examples/**/*.js'],
    ...stylistic.configs.recommended,
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
    },
  },
]

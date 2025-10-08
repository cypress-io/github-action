import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginCypress from 'eslint-plugin-cypress'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  globalIgnores([
    'dist/',
    'examples/component-tests/dist/',
    'examples/nextjs/.next/',
    'examples/nextjs/build/',
    'examples/nextjs/src/app/',
    'examples/wait-on-vite/dist/',
    'examples/**/.pnp.*',
  ]),
  {
    files: ['eslint.config.mjs', 'examples/**/*.js'],
    extends:
      [
        js.configs.recommended,
        pluginCypress.configs.recommended,
        stylistic.configs.recommended,
      ],
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
    },
    languageOptions: {
      globals: globals.node,
    },
  },
])

#!/bin/bash
set -e # fail on error
#
# All examples using npm technology are updated to
# Cypress latest version
#
npmExamples=(
    'basic'
    'browser'
    'component-tests'
    'config'
    'custom-command'
    'env'
    'firefox'
    'install-only'
    'nextjs'
    'node-versions'
    'quiet'
    'recording'
    'start'
    'wait-on'
    'wait-on-vite'
    'webpack'
    )

echo updating npm examples to Cypress latest version
cd examples
for i in ${!npmExamples[@]}; do
echo
echo updating examples/${npmExamples[$i]} to cypress@latest
cd ${npmExamples[$i]}
npm install cypress@latest --save-dev --save-exact
npm ls cypress
cd ..
done
cd ..

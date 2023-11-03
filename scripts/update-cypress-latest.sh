#!/bin/bash
set -e # fail on error
#
# All examples are updated to Cypress latest version
#
# Make sure that Node.js LTS from https://nodejs.org/en/ is installed before running.
# Ensure yarn v1 (classic) and pnpm are installed.
# npm install yarn -g
# npm install pnpm -g
# The VScode editor is also used in the last step if available.
#
# First check if the required package managers are installed
./scripts/check-package-manager-npm.sh
./scripts/check-package-managers-other.sh
# then proceed to updating the examples
echo
./scripts/update-cypress-latest-npm.sh
./scripts/update-cypress-latest-other.sh

echo
echo please manually edit run command in
echo .github/workflows/example-install-only.yml
echo to use latest Cypress version
code .github/workflows/example-install-only.yml

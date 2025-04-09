#!/bin/bash
set -e # fail on error
#
# Examples using the pnpm package manager are
# updated to Cypress latest version
#
# npm must be installed before running this script.
./scripts/check-package-manager-npm.sh

# Make sure that pnpm is installed
if command -v corepack &> /dev/null
then
    echo disabling Corepack for pnpm
    corepack disable pnpm
else
    echo Corepack is not needed and not installed
fi
echo install latest pnpm version
npm add pnpm@latest -g
echo pnpm version $(pnpm --version) is installed

echo
echo updating pnpm examples to Cypress latest version
cd examples

# examples/basic-pnpm (pnpm)
echo
echo updating examples/basic-pnpm to cypress@latest
cd basic-pnpm
pnpm add cypress@latest --save-dev --save-exact
pnpm ls cypress
cd ..

# examples/start-and-pnpm-workspaces
echo
echo updating pnpm workspaces example to Cypress latest version
echo
echo updating examples/start-and-pnpm-workspaces to cypress@latest
cd start-and-pnpm-workspaces
pnpm update cypress --latest --recursive
pnpm ls cypress --recursive
cd ..

cd ..

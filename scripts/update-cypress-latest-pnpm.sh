#!/bin/bash
set -e # fail on error
#
# Examples using the pnpm package manager are
# updated to Cypress latest version
#
# Make sure that pnpm is installed
./scripts/check-package-manager-pnpm.sh

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

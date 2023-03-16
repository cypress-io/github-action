#!/bin/bash
set -e # fail on error
#
# Examples using yarn and pnpm package managers are
# updated to Cypress latest version
#
# Make sure that pnpm and yarn are installed
./scripts/check-package-managers-other.sh

echo updating yarn examples to Cypress latest version
cd examples

# examples/start-and-yarn-workspaces (yarn)
echo
echo updating examples/start-and-yarn-workspaces to cypress@latest
cd start-and-yarn-workspaces
for i in 1 2; do
cd workspace-${i}
echo updating workspace-${i}
npm install cypress@latest --save-dev --save-exact --package-lock=false
npm ls cypress
cd ..
done
echo
echo updating yarn lockfile for start-and-yarn-workspaces
yarn install
cd ..

# examples/install-command (yarn)
echo
echo updating examples/install-command to cypress@latest
cd install-command
yarn add cypress --dev --exact
cd ..

# examples/basic-pnpm (pnpm)
echo updating pnpm example to Cypress latest version
echo
echo updating examples/basic-pnpm to cypress@latest
cd basic-pnpm
pnpm add cypress@latest --save-dev --save-exact
pnpm ls cypress
cd ..

cd ..

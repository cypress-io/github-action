#!/bin/bash
set -e # fail on error
#
# Examples using the yarn package manager are
# updated to Cypress latest version
#
# Make sure that yarn is installed
./scripts/check-package-manager-yarn.sh

echo updating yarn examples to Cypress latest version
cd examples

# examples/start-and-yarn-workspaces (yarn)
echo
echo updating examples/start-and-yarn-workspaces to cypress@latest
cd start-and-yarn-workspaces
for i in 1 2; do
echo updating workspace-${i}
yarn workspace workspace-${i} add cypress --dev --exact
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

# examples/yarn-classic
echo
echo updating examples/yarn-classic to cypress@latest
cd yarn-classic
yarn add cypress --dev --exact
cd ..

# examples/yarn-modern
echo
echo updating examples/yarn-modern to cypress@latest
cd yarn-modern
yarn set version latest
yarn add cypress --dev --exact
cd ..

# examples/yarn-modern-pnp
echo
echo updating examples/yarn-modern-pnp to cypress@latest
cd yarn-modern-pnp
yarn set version latest
yarn add cypress --dev --exact
cd ..

cd ..

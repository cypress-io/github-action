#!/bin/bash
set -e # fail on error
#
if ! command -v corepack &> /dev/null
then
    echo **corepack is required and not installed**
    echo Refer to Yarn Modern installation instructions
    echo https://yarnpkg.com/getting-started/install
    echo https://yarnpkg.com/corepack
    echo
exit 1 # failure
else
    echo corepack version $(corepack --version) is installed
fi
#
# Examples using the yarn package manager are
# updated to Cypress latest version
#
# After running this script, Yarn 1 Classic latest is installed
# corepack is disabled
#
echo updating yarn examples to Cypress latest version
cd examples
# --------------------------------------------------
# Yarn 1 Classic section
# No corepack
corepack disable yarn
npm install yarn@latest -g
echo yarn version $(yarn --version) is installed

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

# --------------------------------------------------
# Yarn 4 Modern section
# Use corepack
corepack enable yarn

# examples/yarn-modern
echo
echo updating examples/yarn-modern to cypress@latest
cd yarn-modern
yarn set version latest
echo yarn version $(yarn --version) is installed
yarn add cypress --dev --exact
cd ..

# examples/yarn-modern-pnp
echo
echo updating examples/yarn-modern-pnp to cypress@latest
cd yarn-modern-pnp
yarn set version latest
echo yarn version $(yarn --version) is installed
yarn add cypress --dev --exact
cd ..

echo
corepack disable yarn
echo corepack is now disabled for Yarn
npm install yarn@latest -g
echo yarn version $(yarn --version) is installed
echo
# End of Yarn 4 Modern section
# --------------------------------------------------

cd ..

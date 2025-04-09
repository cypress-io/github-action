#!/bin/bash
# This script checks that the prerequisite
# Corepack is installed

if ! command -v corepack &> /dev/null
then
    echo **Corepack not installed**
    echo execute the following command:
    echo npm install corepack@latest -g
    echo if npm install fails then reinstall Node.js and try again
    echo
exit 1 # failure
else
    echo corepack version $(corepack --version) is installed
fi

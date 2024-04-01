#!/bin/bash
# This script checks that the prerequisite
# pnpm is installed

if ! command -v pnpm &> /dev/null
then
    echo "**pnpm not installed**"
    echo "execute the following command:"
    echo "npm install pnpm -g"
    echo
exit 1 # failure
else
    echo "pnpm is installed"
fi

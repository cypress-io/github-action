#!/bin/bash
# This script checks that the prerequisites
# pnpm and yarn are installed

pnpmInstalled=false
if ! command -v pnpm &> /dev/null
then
    echo "**pnpm not installed**"
    echo "execute the following command:"
    echo "npm install pnpm -g"
    echo
else
pnpmInstalled=true
fi

yarnInstalled=false
if ! command -v yarn &> /dev/null
then
    echo "**yarn not installed**"
    echo "execute the following command:"
    echo "npm install yarn -g"
    echo
else
yarnInstalled=true
fi

if $pnpmInstalled == true && $yarnInstalled == true
then
    echo "pnpm and yarn are installed"
else
exit 1 # failure
fi

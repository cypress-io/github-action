#!/bin/bash
# This script checks that the prerequisite
# yarn is installed

if ! command -v yarn &> /dev/null
then
    echo "**yarn not installed**"
    echo "execute the following command:"
    echo "npm install yarn -g"
    echo
exit 1 # failure
else
    echo "yarn is installed"
fi

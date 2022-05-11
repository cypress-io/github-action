#!/bin/bash

BINARY="https://cdn.cypress.io/beta/npm/10.0.0/linux-x64/10.0-release-ca83b864100d0d244b54166870fdb4ba952b1275/cypress.tgz"

cd ./examples/v10/basic && npm install $BINARY
cd ../chrome && npm install $BINARY
cd ../component-tests && npm install $BINARY
cd ../config && npm install $BINARY
cd ../custom-command && npm install $BINARY
cd ../env && npm install $BINARY
cd ../firefox && npm install $BINARY
cd ../install-command && npm install $BINARY
cd ../install-only && npm install $BINARY
cd ../node-versions && npm install $BINARY
cd ../quiet && npm install $BINARY
cd ../react-scripts && npm install $BINARY
cd ../recording && npm install $BINARY
cd ../start && npm install $BINARY
cd ../wait-on && npm install $BINARY
cd ../wait-on-vite && npm install $BINARY
cd ../webpack && npm install $BINARY
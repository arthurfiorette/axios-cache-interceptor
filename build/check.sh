#!/usr/bin/env bash

# This script is used to check the umd's ecmascript compatibility.
# It is intended to be run from the project's root directory.

yarn es-check es2017 dist/index.cjs dev/index.cjs dev/index.umd.js

if [ $? -eq 1 ]; then
  exit 1
fi

yarn es-check es2017 dist/index.mjs dev/index.mjs --module

if [ $? -eq 1 ]; then
  exit 1
fi

yarn es-check es5 dist/index.umd.js

if [ $? -eq 1 ]; then
  exit 1
fi

# :)
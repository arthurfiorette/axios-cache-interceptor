#!/usr/bin/env bash

# This script is used to check the umd's ecmascript compatibility.
# It is intended to be run from the project's root directory.

echo "\nStarting checking...\n"

es-check es5 umd/es5.js &
es-check es6 umd/index.js cjs/index.js &
es-check es2017 dev/index.umd.js dev/index.cjs &
es-check es2017 dev/index.mjs --module &
es-check es6 esm/index.js --module &

wait

echo "\nCheck done!"
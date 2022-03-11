#!/usr/bin/env bash

# This script is used to check the umd's ecmascript compatibility.
# It is intended to be run from the project's root directory.

echo "\nStarting checking...\n"

es-check es2015 umd/es5.js &

es-check es2017 umd/index.js cjs/index.js &
es-check es2017 esm/index.js --module &

es-check es2020 dev/index.umd.js dev/index.cjs &
es-check es2020 dev/index.mjs --module &

wait

echo "\nCheck done!"
#!/usr/bin/env bash

# This script is used to check the umd's ecmascript compatibility.
# It is intended to be run from the project's root directory.

echo "\nStarting checking...\n"

es-check es5 umd/es5.min.js &
es-check es6 umd/es6.min.js &

wait

echo "\nCheck done!"
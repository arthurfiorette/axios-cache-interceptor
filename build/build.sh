#!/usr/bin/env bash

# This script is used to build the project.
# It is intended to be run from the project's root directory.

echo "\nStarting build...\n"

rm -rf cjs/ esm/ umd/

echo "Target cleared...\n"

webpack --config build/webpack.config.js &
tsc -p build/tsconfig.cjs.json &
tsc -p build/tsconfig.esm.json &

wait

echo "\nBuild done!"
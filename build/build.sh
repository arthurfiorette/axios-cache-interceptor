#!/usr/bin/env bash

# This script is used to build the project.
# It is intended to be run from the project's root directory.

echo "\nStarting build...\n"

rm -rf cjs/ esm/ umd/ types/ dev/
mkdir  cjs/ esm/ umd/ types/ dev/

echo "Target cleared...\n"

webpack --config build/webpack.config.js &
tsc -p build/tsconfig.types.json &
echo "export * from '../types';" | tee \
  esm/index.d.ts dev/index.d.mts \
  cjs/index.d.ts dev/index.d.cts \
  umd/index.d.ts dev/index.umd.d.ts umd/es5.d.ts \
  > /dev/null &

wait

echo "\nBuild done!"
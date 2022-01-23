#!/usr/bin/env bash

# This script is used to build the project.
# It is intended to be run from the project's root directory.

echo "\nStarting build...\n"

rm -rf cjs/ esm/ umd/ types/
mkdir  cjs/ esm/ umd/ types/

echo "Target cleared...\n"

webpack --config build/webpack.config.js &
tsc -p build/tsconfig.types.json &
echo "export * from '../types';" | tee \
  esm/index.d.ts esm/dev.d.ts \
  cjs/index.d.ts cjs/dev.d.ts \
  umd/index.d.ts umd/dev.d.ts umd/es5.d.ts \
  > /dev/null &

wait

echo "\nBuild done!"
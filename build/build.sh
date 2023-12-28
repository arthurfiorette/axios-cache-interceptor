#!/usr/bin/env bash

# This script is used to build the project.
# It is intended to be run from the project's root directory.

echo "\nStarting build...\n"

rm -rf dev/ dist/
mkdir dev/ dist/

echo "Target cleared...\n"

(
    tsc -p build/tsconfig.types.json
    find dist -name '*.d.ts' ! -name 'index.bundle.d.ts' -exec sh -c 'i="$1"; cp "$i" "${i%.ts}.mts"' shell {} \;
    find dist -name '*.d.mts' -exec sed -i'.bak' -e "s/from '\(.*\)\.js'/from '\1.mjs'/" -e 's/import("\([a-z./-]*\)\.js")/import("\1.mjs")/g' {} \+
    find dist -name '*.d.mts.bak' -delete
) &
webpack --config build/webpack.config.js &

# Add a simple index.d.ts file to type all dev builds
echo "export * from '../dist/index';" | tee dev/index.d.ts dev/index.bundle.d.ts > /dev/null &
echo "export * from './index';" | tee dist/index.bundle.d.ts > /dev/null &

wait

echo "\nBuild done!"

#!/usr/bin/env bash

# This script is used to build the project.
# It is intended to be run from the project's root directory.

echo "Starting build..."

rm -rf dev/ dist/
mkdir dev/ dist/

echo "Target cleared..."

microbundle --define __ACI_DEV__=true -o dev/index.js --tsconfig tsconfig.build.json --generateTypes=false &
microbundle --define __ACI_DEV__=false -o dist/index.js --tsconfig tsconfig.build.json --generateTypes &

# Add a simple index.d.ts file to type all dev builds
echo "export * from '../dist/index.js';" | tee dev/index.d.ts \
dev/index.d.cts \
dev/index.modern.d.ts \
dev/index.module.d.ts \
dev/index.bundle.d.ts > /dev/null &

echo "export * from './index.js';" | tee dist/index.d.cts \
dist/index.modern.d.ts \
dist/index.module.d.ts \
dist/index.bundle.d.ts > /dev/null &

wait

find dist -name '*.d.ts' ! -name 'index.bundle.d.ts' -exec sh -c 'i="$1"; cp "$i" "${i%.ts}.mts"' shell {} \;
find dist -name '*.d.mts' -exec sed -i'.bak' -e "s/from '\(.*\)\.js'/from '\1.mjs'/" -e 's/import("\([a-z./-]*\)\.js")/import("\1.mjs")/g' {} \+
find dist -name '*.d.mts.bak' -delete

echo "Adding license to build files..."

# Get the version from package.json
VERSION=$(node -e "console.log(require('./package.json').version)")

# Text to prepend
HEADER="/*!
 * Axios Cache Interceptor ${VERSION}
 * (c) 2021-present Arthur Fiorette & Contributors
 * Released under the MIT License.
 */
"

# Function to prepend text to files
prepend_header() {
    find "$1" -type f \( -name '*.js' -o -name '*.d.ts' -o -name '*.d.mts' \) -print0 | while IFS= read -r -d '' file; do
        printf "%s%s" "$HEADER" "$(cat "$file")" > "$file"
    done
}

# Prepend header to files in 'dist' and 'dev' folders
prepend_header "dist"
prepend_header "dev"

echo "Build done!"
//@ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { DefinePlugin } = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version } = require('../package.json');

const COPYRIGHT = `// Axios Cache Interceptor v${version} MIT License Copyright (c) 2021-present Arthur Fiorette & Contributors\n`;

/** @type {(...args: string[]) => string} */
const root = (...p) => path.resolve(__dirname, '..', ...p);

/**
 * @param {{
 *   output: string;
 *   esTarget?: string;
 *   libraryType: import('webpack').LibraryOptions['type'];
 *   libraryName?: import('webpack').LibraryOptions['name'];
 *   inlineDeps?: boolean;
 *   devBuild?: boolean;
 * }} options
 * @returns {import('webpack').Configuration}
 */
const config = ({
  output,
  esTarget = 'es2017',
  libraryType,
  libraryName,
  inlineDeps = false,
  devBuild = false
}) => ({
  mode: 'production',

  entry: root('src', 'index.ts'),

  output: {
    path: root(),
    globalObject: `typeof self !== 'undefined' ? self : this`,
    filename: output,
    sourceMapFilename: output + '.map',
    chunkFormat: 'module',
    module: libraryType === 'module',
    library: {
      type: libraryType,
      name: libraryName
    }
  },

  target: esTarget,
  devtool: devBuild ? 'source-map' : false,

  experiments: { outputModule: true },
  resolve: { extensions: ['.ts', '.js'] },

  externals: inlineDeps
    ? {
        'cache-parser': 'cache-parser',
        'object-code': 'object-code',
        'fast-defer': 'fast-defer'
      }
    : undefined,

  module: {
    rules: [
      {
        // Include node_modules to parse all javascript files imported
        include: /src|node_modules/,
        test: /\.(ts|js)$/,
        loader: 'ts-loader',
        options: {
          configFile: root('build', 'tsconfig.build.json'),
          compilerOptions: {
            target: esTarget
          }
        }
      }
    ]
  },

  optimization: {
    minimize: true,
    sideEffects: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    concatenateModules: true,
    minimizer: [new TerserWebpackPlugin({ parallel: true })]
  },

  plugins: [
    // Chooses the right environment
    new DefinePlugin({ __ACI_DEV__: devBuild }),

    // Add a banner to the top of each file
    {
      apply: (compiler) => {
        compiler.hooks.emit.tapAsync('FileListPlugin', (comp, cb) => {
          for (const chunk of comp.chunks) {
            for (const filename of chunk.files) {
              const assets = comp.assets[filename];

              // @ts-expect-error - _value is not a public property
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              assets._value = COPYRIGHT + assets._value;
            }
          }

          cb();
        });
      }
    }
  ]
});

module.exports = [
  // ESModule
  config({
    output: 'dist/index.mjs',
    libraryType: 'module',
    inlineDeps: true
  }),
  config({
    output: 'dev/index.mjs',
    libraryType: 'module',
    inlineDeps: true,
    devBuild: true
  }),

  // CommonJS
  config({
    output: 'dist/index.cjs',
    libraryType: 'commonjs2',
    inlineDeps: true
  }),
  config({
    output: 'dev/index.cjs',
    libraryType: 'commonjs2',
    inlineDeps: true,
    devBuild: true
  }),

  // Browser Bundle
  config({
    // Uses ES5 for UMD builds to support more browsers
    esTarget: 'es5',
    output: 'dist/index.bundle.js',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor'
  })
];

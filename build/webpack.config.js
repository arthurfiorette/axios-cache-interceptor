//@ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { DefinePlugin } = require('webpack');

const root = (...p) => path.resolve(__dirname, '..', ...p);

/**
 * @param {{
 *   output: string;
 *   esTarget: string;
 *   libraryType: import('webpack').LibraryOptions['type'];
 *   libraryName?: import('webpack').LibraryOptions['name'];
 *   inlineDeps?: boolean;
 *   devBuild?: boolean;
 * }} options
 * @returns {import('webpack').Configuration}
 */
const config = ({
  output,
  esTarget,
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
        include: root('src'),
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

  plugins: [new DefinePlugin({ __ACI_DEV__: devBuild })]
});

module.exports = [
  // ESModule
  config({
    esTarget: 'es2017',
    output: 'esm/index.js',
    libraryType: 'module',
    inlineDeps: true
  }),
  config({
    esTarget: 'es2020',
    output: 'dev/index.mjs',
    libraryType: 'module',
    inlineDeps: true,
    devBuild: true
  }),

  // CommonJS
  config({
    esTarget: 'es2017',
    output: 'cjs/index',
    libraryType: 'commonjs2',
    inlineDeps: true
  }),
  config({
    esTarget: 'es2020',
    output: 'dev/index.cjs',
    libraryType: 'commonjs2',
    inlineDeps: true,
    devBuild: true
  }),

  // UMD
  config({
    esTarget: 'es2017',
    output: 'umd/index.js',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor'
  }),
  config({
    esTarget: 'es2020',
    output: 'dev/index.umd.js',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor',
    devBuild: true
  }),
  config({
    esTarget: 'es5',
    output: 'umd/es5.js',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor'
  })
];

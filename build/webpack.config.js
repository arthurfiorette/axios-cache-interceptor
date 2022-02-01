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
    filename: output + '.js',
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
    output: 'esm/index',
    libraryType: 'module',
    inlineDeps: true
  }),
  config({
    esTarget: 'es2020',
    output: 'esm/dev',
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
    output: 'cjs/dev',
    libraryType: 'commonjs2',
    inlineDeps: true,
    devBuild: true
  }),

  // UMD
  config({
    esTarget: 'es2017',
    output: 'umd/index',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor'
  }),
  config({
    esTarget: 'es2020',
    output: 'umd/dev',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor',
    devBuild: true
  }),
  config({
    esTarget: 'es5',
    output: 'umd/es5',
    libraryType: 'umd',
    libraryName: 'AxiosCacheInterceptor'
  })
];

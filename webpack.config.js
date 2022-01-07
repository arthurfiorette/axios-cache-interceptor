//@ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');

/**
 * @param {{
 *   output: string;
 *   entry: string;
 *   esTarget: string;
 *   minimize: boolean;
 *   override?: import('typescript').CompilerOptions;
 *   library?: import('webpack').LibraryOptions;
 * }} options
 * @returns {import('webpack').Configuration}
 */
const config = ({ output, esTarget, minimize, entry, override = {}, library }) => ({
  mode: 'production',

  entry: path.resolve(__dirname, 'src', entry),

  output: {
    path: path.resolve(__dirname, 'dist'),
    globalObject: `typeof self == 'undefined' ? this : self`,
    filename: output,
    library: {
      type: 'umd',
      name: 'AxiosCacheInterceptor',
      ...library
    },
    chunkFormat: 'module'
  },

  target: esTarget,

  resolve: {
    extensions: ['.ts', '.js']
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        include: path.resolve(__dirname, 'src'),
        test: /\.(ts|js)$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.build.json'),
          compilerOptions: {
            target: esTarget,
            ...override
          }
        }
      }
    ]
  },

  optimization: {
    minimize,
    minimizer: [new TerserWebpackPlugin({ parallel: true })]
  }
});

module.exports = [
  config({
    esTarget: 'es2020',
    entry: 'index.development.ts',
    output: 'index.development.js',
    minimize: false
  }),
  config({
    esTarget: 'es2015', // ES6
    entry: 'index.ts',
    output: 'index.min.js',
    minimize: true
  }),
  config({
    esTarget: 'es5',
    entry: 'index.ts',
    output: 'index.es5.min.js',
    minimize: true
  }),
  config({
    esTarget: 'es2020',
    entry: 'index.ts',
    output: 'index.es2020.min.js',
    minimize: true
  }),
  config({
    esTarget: 'es2017',
    entry: 'index.ts',
    output: 'index.js',
    minimize: true,
    library: {
      type: 'commonjs',
      name: undefined
    },
    override: {
      declaration: true,
      declarationMap: true
    }
  })
];

//@ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'production',

  entry: path.resolve(__dirname, 'src', 'index.browser.ts'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.min.js',
    libraryTarget: 'umd',
    library: 'AxiosCacheInterceptor'
  },

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
          configFile: 'tsconfig.browser.json'
        }
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin({ parallel: true })]
  }
};

module.exports = config;

//@ts-check
/* eslint-disable */

const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  mode: 'production',

  entry: path.resolve(__dirname, 'src', 'index.bundle.ts'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.bundle.js',
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
        test: /\.(tsx?|jsx?)$/,
        exclude: /node_modules\/(?!(@tusbar\/cache-control))/,
        use: { loader: 'babel-loader' }
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin()]
  }
};

module.exports = config;
const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");
const glob = require("glob");

const scriptDir = "./src/scripts/"
const connectorDir = "./src/connectors/"

module.exports = {
  entry: {
      background: path.join(__dirname, scriptDir + 'background.ts')
  },
  output: {
      path: path.join(__dirname, 'dist/js'),
      filename: '[name].js'
  },
  optimization: {
      splitChunks: {
          name: 'vendor',
          chunks: "initial"
      }
  },
  module: {
      rules: [
          {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/
          }
      ]
  },
  resolve: {
      extensions: ['.ts', '.tsx', '.js']
  },
  mode: 'none',
  plugins: [
      // exclude locale files in moment
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new CopyPlugin({
          patterns: [{ from: '.', to: '../', context: 'public' }],
          options: {}
      }),
  ]
};
const webpack = require("webpack");
const failPlugin = require("webpack-fail-plugin");

module.exports = {
  entry: "./components/main.tsx",
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  devtool: "source-map",
  resolve: {
    extensions: ['', '.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }, {
        test: /\.css$/,
        loader: "style-loader!css-loader?minimize"
      }
    ]
  },
  plugins: [
    failPlugin
  ]
};

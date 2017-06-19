const webpack = require("webpack");

module.exports = {
  entry: "./js/components/main.tsx",
  output: {
    path: __dirname,
    filename: 'js/bundle.js'
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      }, {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { "minimize": true } }
        ]
      }
    ]
  }
};

const webpack = require("webpack");

module.exports = {
  entry: {
    bundle: "./js/components/main.tsx",
    landing_page: "./js/landing_page.ts"
  },
  output: {
    path: __dirname + "/js",
    filename: "[name].js"
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

const webpack = require("webpack");

module.exports = {
  entry: {
    editor: "./js/editor/components/main.tsx",
    landing_page: "./js/landing_page/index.ts",
    trigger: "./js/trigger/main.tsx"
  },
  output: {
    path: __dirname + "/dist",
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

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { merge } = require('webpack-merge')
const VueServerClientPlugin = require('vue-server-renderer/client-plugin')
const base = require('./webpack.base')
function resolve (dir) {
  return path.resolve(__dirname, dir)
}

module.exports = merge(base, {
  entry: {
    client: resolve('../src/client-entry.js')
  },
  plugins: [
    new VueServerClientPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('../public/index.html')
    })
  ]
})
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { merge } = require('webpack-merge')
const base = require('./webpack.base')
const VueServerServerPlugin = require('vue-server-renderer/server-plugin')

function resolve (dir) {
  return path.resolve(__dirname, dir)
}

module.exports = merge(base, {
  entry: {
    server: resolve('../src/server-entry.js')
  },
  target: 'node',
  output: {
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new VueServerServerPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.ssr.html',
      template: resolve('../public/index.ssr.html'),
      excludeChunks: ['server'],
      minify: false
    })
  ]
})
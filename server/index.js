const Koa = require('koa')
const Router = require('@koa/router')
const vueServerRenderer = require('vue-server-renderer')
const app = new Koa()
const fs = require('fs')
const path = require('path')
const router = new Router()
const static = require('koa-static')
const serverBundle = require('../dist/vue-ssr-server-bundle.json')
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.ssr.html'), 'utf8')
const clientManifest = require('../dist/vue-ssr-client-manifest.json')
const renderer = vueServerRenderer.createBundleRenderer(serverBundle, {
  template,
  clientManifest
})
router.get('/(.*)', async (ctx) => {
  // 在渲染页面时 需要让服务器根据当前路径渲染对应的路由
 ctx.body = await renderer.renderToString({ url: ctx.url })
})
app.use(router.routes())
app.use(static(path.resolve(__dirname, '../dist')))
app.listen(9000)
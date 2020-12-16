const Koa = require('koa')
const Router = require('@koa/router')
const vueServerRenderer = require('vue-server-renderer')
const app = new Koa()
const fs = require('fs')
const path = require('path')
const router = new Router()
const static = require('koa-static')
const serverBundle = fs.readFileSync(path.resolve(__dirname, '../dist/server.bundle.js'), 'utf8')
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.ssr.html'), 'utf8')
const renderer = vueServerRenderer.createBundleRenderer(serverBundle, {
  template
})
router.get('/', async (ctx) => {
 ctx.body = await renderer.renderToString()
})
app.use(router.routes())
app.use(static(path.resolve(__dirname, '../')))
app.listen(9000)
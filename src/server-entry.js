import createApp from './app'


export default (context) => {
  return new Promise((resove, reject) => {

    const { app, router } = createApp()
    router.push(context.url)
    router.onReady(() => {
      resove(app)
    }, reject)
  })
  return app
}
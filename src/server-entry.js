import createApp from './app'


export default (context) => {
  return new Promise((resove, reject) => {

    const { app, router, store } = createApp()
    router.push(context.url)
    router.onReady(() => {
      // 当前路由匹配到的所有页面级组件
      const matchComponents = router.getMatchedComponents()
      if (matchComponents.length) {
        Promise.all(matchComponents.map(component => {
          if (component.asyncData) {
            console.log(22)
            return component.asyncData(store)
          }
        })).then(() => {
          // 自动会将结果放到window上
          context.state = store.state // 同步客户端的store
          resove(app)
        }, reject)
      } else {
        reject({ code: 404 })
      }
    }, reject)
  })
  return app
}
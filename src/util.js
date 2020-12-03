export function proxy (vm, data, key) {
  Object.defineProperty(vm, key, {
    get () {
      return vm[data][key]
    },
    set (val) {
      vm[data][key] = val
    }
  })
}

export function defineProperty (target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: false,
    value
  })
}

let callbacks = []
let waiting = false
function flushCallback () {
  for(let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
  waiting = false
}
// 1.第一次cb渲染watcher更新操作调用nextTick,页面初渲染
// 2. 第二次是用户主动调用nextTick的cb
// 3.所以当在页面中使用nextTick,页面渲染与nextTick的回调都是在宏任务结束后同步执行，渲染先

export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    waiting = true
    Promise.resolve().then(flushCallback) // 多次调用nextTick，只执行一次
  }
}
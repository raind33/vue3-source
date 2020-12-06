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

const hooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted'
]
const strat = {}
strat.components = mergeComponents
function mergeComponents (parent, child) {
  const res = Object.create(parent)
  if (child) {

    for(let key in child) {
      res[key] = child[key]
    }
  }
  return res
}
hooks.forEach(hook => {
  strat[hook] = mergeHook
})
function mergeHook (parent, child) {
  if (child) {
    if (parent) {
      return parent.concat(child)
    } else {
      return [child]
    }
  } else {
    return parent
  }
}
export function mergeOptions (parent, child) {
  let options = {}

  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }
  return options
  function mergeField (key) {
    if (strat[key]) {
      options[key] = strat[key](parent[key], child[key])
      return
    }
    if (isObj(parent[key]) && isObj(child[key])) {
      options[key] = Object.assign(parent[key], child[key])
    } else {
      if (child[key]) {
        options[key] = child[key]
      } else if (parent[key]) {
        options[key] = parent[key]
      }
    }

  }

}

export function isObj (val) {
  return typeof val === 'object' && typeof val !== 'null'
}


function makeup (str) {
  const map = {}
  str.split(',').forEach(tag => {
    map[tag] = true
  })
  return (val) => map[val] || false
}
export const isReservedTag = makeup('a,p,ul,li,ol,div,span,input,button')
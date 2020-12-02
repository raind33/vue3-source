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
export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    waiting = true
    Promise.resolve().then(flushCallback)
  }
}
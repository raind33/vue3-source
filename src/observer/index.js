import { newArrayProto } from './array'
class Observer {
  constructor (data) {
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      configurable: false,
      value: this
    })
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto
      this.observedArray(data)
      return
    }
    this.walk(data)
  }
  observedArray (arr) {
    arr.forEach(item => {
      observe(item)
    })
  }
  walk (data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
  
}
function defineReactive (data, key, val) {
  observe(val)
  Object.defineProperty(data, key, {
    get () {
      console.log('获取值')
      return val
    },
    set (newVal) {
      console.log('设置值')
      if (val === newVal) return
      observe(newVal)
      val = newVal
    }
  })
}
export function observe (data) {
  if (typeof data !== 'object' || typeof data === null) {
    return data
  }

  if (data.__ob__) return data
  return new Observer(data)
}
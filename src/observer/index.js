import { newArrayProto } from './array'
import { defineProperty } from '../util'
import Dep from './dep'
class Observer {
  constructor (data) {
    defineProperty(data, '__ob__', this)
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

  const dep = new Dep() // 每次都会给属性创建一个dep

  Object.defineProperty(data, key, {
    get () {
      // console.log('获取值')
      if (Dep.target) {
        dep.depend() // 让这个属性自己的dep记住这个watcher
      }
      return val
    },
    set (newVal) {
      // console.log('设置值')
      if (val === newVal) return
      observe(newVal)
      val = newVal
      dep.notify()
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
import { newArrayProto } from './array'
import { defineProperty } from '../util'
import Dep from './dep'
class Observer {
  constructor (data) {
    this.dep = new Dep() // 给数组和对象本身增加一个dep属性
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

// 让里层数组收集外层数组的依赖，这样修改里层数组也可以更新视图
function dependArray (val) {
  for(let i = 0; i < val.length;i++) {
    const current = val[i]
    current.__ob__ && current.__ob__.dep.depend()
    if (Array.isArray(current)) {
      dependArray(current)
    }
  }
}
function defineReactive (data, key, val) {
  const childOb = observe(val)

  const dep = new Dep() // 每次都会给属性创建一个dep

  Object.defineProperty(data, key, {
    get () {
      // console.log('获取值')
      if (Dep.target) {
        dep.depend() // 让这个属性自己的dep记住这个watcher
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(val)) {
            dependArray(val)
          }
        }
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
    return
  }

  if (data.__ob__) return data
  return new Observer(data)
}
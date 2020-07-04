import { isObject, hasOwn, hasChanged } from '../shared/utils'

import { reactive } from './reactive'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operation'
const get = createGetter()
const set = createSetter()

function createGetter() {
  return function get(target, key, reciver) {
    const res = Reflect.get(target, key, reciver)
    // console.log('取值了', target, key)
    /**
     * 取值的过程中，再去做代理
     * 而不是像2.0的时候，一开始就递归做响应式代理，提高性能
     */
    track(target, TrackOpTypes.GET, key)
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  }
}
function createSetter() {
  return function set(target, key, value, reciver) {
    // 判断属性是新增还是修改，如果原来的值与新设置的值一样，就什么都不做
    const hadKey = hasOwn(target, key)
    const oldVal = target[key]
    const result = Reflect.set(target, key, value, reciver)
    if (!hadKey) {
      // console.log('属性新增', target, key)
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(value, oldVal)) {
      // console.log('修改操作', target, key)
      trigger(target, TriggerOpTypes.SET, key, value, oldVal)
    }

    return result
  }
}

export const mutableHandler = {
  get,
  set,
}

import { isFunction } from "../shared/utils"
import { effect, track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operation"

export function computed (getterOptions) {
  let getter, setter

  if (isFunction(getterOptions)) {
    getter = getterOptions
  } else {
    getter = getterOptions.get
    setter = getterOptions.set
  }

  let dirty = true
  let runner = effect(getter, {
    lazy: true,
    computed: true,
    schedular: () => {
      if (!dirty) {
        dirty = true // 等计算属性依赖的值变化时，就会执行这个函数
        trigger(computed, TriggerOpTypes.SET, 'value')
      }
    }
  })
  let value
  const computed = {
    get value() {
      if (dirty) {
        value = runner()
        dirty = false
        track(computed, TrackOpTypes.GET, 'value')
      }
      return value
    },
    set value(newVal) {
      setter(newVal)
    }
  }

  return computed
}
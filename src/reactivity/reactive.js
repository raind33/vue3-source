import { isObject } from '../shared/utils'
import { mutableHandler } from './baseHandles'
export function reactive (target) {
  
  return createReactiveObject(target, mutableHandler)
}

function createReactiveObject (target, handler) {
  if (!isObject(target)) return target

  const observed = new Proxy(target, handler)

  return observed
}

import { initState } from './state'
export function initMixin (Vue) {
  Vue.prototype._init = function (opts) {
    
    const vm = this
    vm.$options = opts
    initState(vm)
  }
}

import { compileToFunction } from './compiler/index'
import { initState } from './state'
export function initMixin (Vue) {
  Vue.prototype._init = function (opts) {
    
    const vm = this
    vm.$options = opts
    initState(vm)
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }

  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    const opts = vm.$options

    el = document.querySelector(el)

    if (!opts.render) {
      let template = opts.template
      if (!template && el) {
        template = el.outerHTML
      }
      opts.render = compileToFunction(template)
    }
  }
}

import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'
import { initState } from './state'
import { nextTick } from './util'
export function initMixin (Vue) {
  Vue.prototype._init = function (opts) {
    
    const vm = this
    vm.$options = opts
    initState(vm)
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }

  }
  Vue.prototype.$nextTick = nextTick
  Vue.prototype.$mount = function (el) {
    const vm = this
    const opts = vm.$options

    el = document.querySelector(el)
    vm.$el = el
    if (!opts.render) {
      let template = opts.template
      if (!template && el) {
        template = el.outerHTML
      }
      opts.render = compileToFunction(template)
    }

    mountComponent(vm, el)
  }
}
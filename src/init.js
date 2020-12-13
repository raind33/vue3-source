
import { compileToFunction } from './compiler/index'
import { callHook, mountComponent } from './lifecycle'
import { initState } from './state'
import { mergeOptions, nextTick } from './util'
import Watcher from "./observer/watcher"

export function initMixin (Vue) {
  Vue.prototype._init = function (opts) {
    
    const vm = this
    vm.$options = mergeOptions(vm.constructor.options, opts)
    console.log(vm.$options)
    callHook(vm, 'beforeCreate')
    initState(vm)
    callHook(vm, 'created')
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }

  }
  Vue.prototype.$nextTick = nextTick
  Vue.prototype.$watch = function (exOrFn, cb, options) {
    const watcher = new Watcher(this, exOrFn, cb, {...options, user: true})
  }
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

    mountComponent(vm)
  }
}
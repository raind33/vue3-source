import { patch } from "./vdom/patch"
import Watcher from "./observer/watcher"

export function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    const prev = vm._vnode
    vm._vnode = vnode
    if (!prev) {

      vm.$el = patch(vm.$el, vnode)
    } else {
      vm.$el = patch(prev, vnode)
    }
    console.log(vm.$el)
  }
}
export function callHook (vm, key) {
  const handlers = vm.$options[key]
  handlers && handlers.forEach(handle => handle.call(vm))
}
export function mountComponent (vm) {

  const updateComponent = () => {

    vm._update(vm._render())
  }

  // true代表是渲染watcher
  new Watcher(vm, updateComponent, () => {}, true)
}
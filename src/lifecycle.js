import { patch } from "./vdom/patch"
import Watcher from "./observer/watcher"

export function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    vm.$el = patch(vm.$el, vnode)
    console.log(vm.$el)
  }
}
export function mountComponent (vm, el) {

  const updateComponent = () => {

    vm._update(vm._render())
  }

  // true代表是渲染watcher
  new Watcher(vm, updateComponent, () => {}, true)
}
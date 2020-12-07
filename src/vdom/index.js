import { isReservedTag, isObj } from '../util'

export function renderMixin(Vue) {
  Vue.prototype._c = function () {
    const vm = this
    return createElement(vm, ...arguments)
  }
  Vue.prototype._s = function (val) {
    return val === null
      ? ''
      : typeof val === 'object'
      ? JSON.stringify(val)
      : val
  }
  Vue.prototype._v = function (text) {
    const vm = this
    return createTextVnode(vm, text)
  }
  Vue.prototype._render = function () {
    const vm = this
    const render = vm.$options.render

    const vnode = render.call(vm)
    return vnode
  }
}

function createElement(vm, tag, data = {}, ...children) {
  if (!isReservedTag(tag)) {
    const Ctor = vm.$options.components[tag]
    return createComponent(vm, tag, data, data.key, children, Ctor)
  }

  return vnode(vm, tag, data, data.key, children)
}

// 创建组件vnode
function createComponent(vm, tag, data, key, children, Ctor) {
  if (isObj(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor)
  }
  // 给组件增加生命周期
  data.hook = {
    init(vnode) {
      const child = vnode.componentInstance = new vnode.componentOptions.Ctor({})
      child.$mount()
    },
  }
  return vnode(
    vm,
    `vue-component-${Ctor.cid}-${tag}`,
    data,
    key,
    undefined,
    undefined,
    { Ctor }
  )
}

function createTextVnode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions,
  }
}

export function isSameNode (oldNode, newNode) {
  if (oldNode.tag === newNode.tag && oldNode.key === newNode.key) return true
  return false
}

import { observe } from './observer/index'
import { proxy } from './util'
import Watcher from './observer/watcher'
 
export function initState (vm) {
  const opts = vm.$options

  if (opts.props) {
    initProps(vm)
  }
  if (opts.data) {
    initData(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
}

function initProps () {}
function initData (vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  observe(data)
}
function initMethods () {}
function initWatch (vm) {
  const watch = vm.$options.watch
  for(let key in watch) {
    let handler = watch[key]
    if (Array.isArray(handler)) { // 字符串、数组、对象、函数
      val.forEach(handler => createUserWatcher(vm, key, handler))
    } {
      createUserWatcher(vm, key, handler)
    }
  }
}

function createUserWatcher (vm, exprOrfn, handler, options = {}) {
  if (typeof handler === 'object') {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  vm.$watch(exprOrfn, handler, options)
}
function initComputed () {}
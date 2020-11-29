import { observe } from './observer/index'
import { proxy } from './util'
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
function initWatch () {}
function initComputed () {}
import { applyMixin } from "./mixin"
import ModuleCollection from "./module/module-collection"
import { forEach } from "./utils"
export let Vue
export  class Store {
  constructor (options) {
    
    const state = options.state
    const plugins = options.plugins
    this._modules = new ModuleCollection(options)
    this._wrapperGetters = {}
    this._actions = {}
    this._mutations = {}
    this._subsrcibes = []
    installModules(this, state, [], this._modules.root)
    console.log(state, this._actions, this._mutations)
    resetStoreVM(this, state)
    plugins.forEach(fn => {
      fn(this)
    })
  }
  subscribe (fn) {
    this._subsrcibes.push(fn)
  }
  replaceState (state) {
    this._vm._data.$$state = state
  }
  commit = (type, payload) => {
    this._mutations[type].forEach(fn => {
      fn(payload)
      this._subsrcibes.forEach(sub => {
        sub(fn, this._modules.root.state)
      })
    })
    // this._mutations[type](payload)
  }
  dispatch = (type, payload) => {
    this._actions[type].forEach(fn => {
      fn(payload)
    })
  }
  get state () {
    return this._vm._data.$$state
  }
}
function installModules (store, rootState, path, module) {
  const namespace = store._modules.getNameSpace(path)
  console.log(namespace)
  // 将所有子模块的状态安装到父模块上
  if (path.length > 0) {
    const parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current]
    }, rootState)
    // parent[path[path.length - 1]] = module.state
    Vue.set(parent, path[path.length - 1], module.state)
  }
  // 在没有命名空间情况下，所有的mutations与actions、getters都定义到根模块
  module.forEachMutations((mutation, type) => {
    store._mutations[namespace+type] = (store._mutations[type]) || []
    store._mutations[namespace+type].push((payload) => {
      mutation.call(store, module.state, payload)
    })
  })
  module.forEachActions((action, type) => {
    store._actions[namespace+type] = (store._actions[type]) || []
    store._actions[namespace+type].push((payload) => {
      action.call(store, store, payload)
    })
  })
  module.forEachGetters((getters, key) => {
    // 如果getters重名会覆盖
    store._wrapperGetters[key] = function () {
      return getters(module.state)
    }
  })
  module.forEachChildren((child, key) => {
    installModules(store, rootState, path.concat(key), child)
  })
}
function resetStoreVM (store, state) {
  const computed = {}
  store.getters = {}
  forEach(store._wrapperGetters, (fn, key) => {
    computed[key] = () => {
      return fn()
    }
    Object.defineProperty(store.getters, key, {
      get: () => {
        return store._vm[key]
      }
    })
  })
  store._vm = new Vue({
    data () {
      return { 
        $$state: state
      }
    },
    computed
  })
  console.log(store, state)
}
export const install = (_vue) => {
  Vue = _vue
  applyMixin(Vue)
}

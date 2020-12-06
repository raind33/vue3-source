import { mergeOptions } from "../util"

export function initGlobalApi (Vue) {
  Vue.options = {}

  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    console.log(this.options)

  }

  Vue.options.components = {}
  Vue.options._base = Vue
  Vue.component = function (id, definition) {
    definition.name = id || definition.name
    definition = this.options._base.extend(definition)
    this.options.components[id] = definition
    
  }
  let cid = 0
  Vue.extend = function (options) {
    const Super = this

    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.cid = cid++
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.component = Super.component

    Sub.options = mergeOptions(Super.options, options)

    return Sub
  }
}


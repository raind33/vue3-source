import { mergeOptions } from "../util"

export function initGlobalApi (Vue) {
  Vue.options = {}

  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    console.log(this.options)

  }
}


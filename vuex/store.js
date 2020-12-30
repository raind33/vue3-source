import { applyMixin } from "./mixin"

export let Vue
export  class Store {
  constructor ({ state }) {
    // this.state = state
    this._vm = new Vue({
      data () {
        return {
          $$state: state
        }
      }
    })
  }
  get state () {
    return this._vm._data.$$state
  }
}

export const install = (_vue) => {
  Vue = _vue
  applyMixin(Vue)
}
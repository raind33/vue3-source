import { applyMixin } from "./mixin"

export let Vue
export  class Store {

}

export const install = (_vue) => {
  Vue = _vue
  applyMixin(Vue)
}
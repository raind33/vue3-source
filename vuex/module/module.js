import { forEach } from "../utils"

class Module {
  constructor (newModule) {
    this._raw = newModule
    this.children = {}
    this.state = newModule.state
  }
  getChild (key) {
    return this.children[key]
  }
  addChild (key, module) {
    this.children[key] = module
  }
  forEachMutations (fn) {
    if (this._raw.mutations) {
      forEach(this._raw.mutations, fn)
    }
  }
  forEachActions (fn) {
    if (this._raw.actions) {
      forEach(this._raw.actions, fn)
    }
  }
  forEachGetters (fn) {
    if (this._raw.getters) {
      forEach(this._raw.getters, fn)
    }
  }
  forEachChildren (fn) {
    forEach(this.children, fn)
  }
}

export default Module
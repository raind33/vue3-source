import { popTarget, pushTarget } from "./dep"

let id = 0
export default class Watcher {
  constructor (vm, exprOrFn, cb, renderWatcher) {
    this.vm = vm
    this.cb = cb
    this.getter = exprOrFn
    this.options = vm.options
    this.id = id++
    this.deps = []
    this.depsId = new Set()
    this.get()
  }

  // 当属性取值时，需要记住这个watcher。数据再次变化，就去执行自己记住的这个watcher
  get () { // 这个方法会对属性进行取值
    pushTarget(this)
    this.getter()
    popTarget()
  }

  addDep (dep) {
    if (!this.depsId.has(dep.id)) {
      this.depsId.add(dep.id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  
  update () {
    this.get()
  }
}
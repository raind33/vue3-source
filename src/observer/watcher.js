import { popTarget, pushTarget } from "./dep"
import { queueWatcher } from "./schedular"

let id = 0
export default class Watcher {
  constructor (vm, exprOrFn, cb, options={}) {
    this.vm = vm
    this.cb = cb
    this.options = options
    this.lazy = options.lazy
    this.dirty = this.lazy
    this.user = options.user
    if (typeof exprOrFn === 'string') {
      this.getter = function () {
        const path = exprOrFn.split('.')
        let val = vm
        for(let i = 0; i< path.length;i++) {
          const key = path[i]
          val = val[key]
        }
        return val
      }
    } else {

      this.getter = exprOrFn
    }
    this.id = id++
    this.deps = []
    this.depsId = new Set()
    if (this.options.immediate) {
      this.cb()
    }
    this.val = this.lazy ? void 0 : this.get()
  }

  // 当属性取值时，需要记住这个watcher。数据再次变化，就去执行自己记住的这个watcher
  get () { // 这个方法会对属性进行取值
    pushTarget(this)
    const val = this.getter.call(this.vm)
    popTarget()
    return val
  }
  execute () {
    this.val = this.get()
    this.dirty = false
  }
  depend () {
    const deps = this.deps
    deps.forEach(dep => {
      dep.depend() // 收集渲染watcher
    })
  }
  addDep (dep) {
    if (!this.depsId.has(dep.id)) {
      this.depsId.add(dep.id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  run () {
    let newVal = this.get()
    let oldval = this.val
    this.val = newVal
    if (this.user) {
      this.cb.call(this.vm, newVal, oldval)
    }
  }
  update () {
    if (this.lazy) {
      this.dirty = true
    } else {
      queueWatcher(this)
    }
    // this.get()
  }
}